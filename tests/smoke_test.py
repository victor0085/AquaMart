"""AQUAMART smoke test: opens the site in a real (headless) browser and checks the main pages,
cart maths, payment outcomes, addresses and notifications.

Run it:
    pip install playwright && playwright install chromium
    python -m http.server 8123          # in one terminal, inside the project folder
    python tests/smoke_test.py          # in another terminal
Everything printed should look healthy (routes 21/21, match True, errors only about fonts).
"""
from playwright.sync_api import sync_playwright
U="http://localhost:8123/index.html"
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();errs=[]
    pg.on("pageerror",lambda e:errs.append("PAGE:"+str(e)))
    pg.on("console",lambda m:m.type=="error" and "403" not in m.text and "404" not in m.text and errs.append("CONSOLE:"+m.text[:100]))
    pg.goto(U);pg.wait_for_timeout(900)
    # log in as demo to see account pages
    pg.evaluate("authService.login('demo@aquamart.com','Demo123!',true)");pg.wait_for_timeout(1200)
    routes=["","categories","shop","shop?cat=power","product/tecno-spark-40","cart","wishlist","login","signup","forgot-password","account","account/addresses","account/notifications","orders","help","contact","about","terms","seller","checkout","nonsense"]
    empty=[]
    for r in routes:
        pg.goto(U+"#/"+r);pg.wait_for_timeout(700)
        if len(pg.inner_text("#app").strip())<20: empty.append(r)
    print("routes rendered:",len(routes)-len(empty),"/",len(routes),"empty:",empty)
    oid=pg.evaluate("orderService.mine ? orderService.mine()[0].id : (arrOrders=readList('orders'))[0].id")
    for r in ["order/"+oid,"track/"+oid]:
        pg.goto(U+"#/"+r);pg.wait_for_timeout(800);print(r[:6],"page ok:",len(pg.inner_text("#app"))>50)
    # cart maths (independent calculation)
    res=pg.evaluate("""()=>{
      storage.remove('coupon');cartService.write({items:[],saved:[]});
      const ok1=cartService.add(1,2), p=productService.get(1);
      let t=cartService.totals(cartService.read().items,'standard');
      const sub=p.oldPrice*2, disc=(p.oldPrice-p.price)*2, net=sub-disc;
      const exp={subtotal:sub,discount:disc,shippingFee:net>=50000?0:2500,tax:Math.round(net*.075)};exp.total=net+exp.tax+exp.shippingFee;
      storage.set('coupon','AQUA10');const c=cartService.totals(cartService.read().items,'standard');
      const dumb=productService.all().find(x=>x.stock===0);
      return {added:ok1,count:cartService.count(),match:JSON.stringify(t)===JSON.stringify(exp),express:cartService.totals(cartService.read().items,'express').shippingFee,
        couponLower:c.discount>t.discount,soldOut:cartService.add(dumb.id),setQty:(cartService.setQty(0,999),cartService.read().items[0].qty===p.stock||cartService.read().items[0].qty<=p.stock),
        save:(cartService.save(0),cartService.read().saved.length===1&&cartService.count()===0),restore:(cartService.restore(0),cartService.count()>0),
        wish:[wishService.toggle(2),wishService.has(2),wishService.toggle(2),wishService.has(2)]}}""")
    print("cart:",res)
    pay=pg.evaluate("""async()=>{const r={};
      r.luhn=[passesLuhnCheck('4242 4242 4242 4242'),passesLuhnCheck('1234 5678 9012 3456')];
      r.ok=(await paymentService.processPayment({method:'card',card:{number:'4242424242424242'}})).status;
      for(const [k,n] of [['declined','4000000000000002'],['timeout','4000000000009119']]){try{await paymentService.processPayment({method:'card',card:{number:n}});r[k]='no error'}catch(e){r[k]=e.timeout?'timeout':'declined'}}
      r.cod=(await paymentService.processPayment({method:'cod'})).status;return r}""")
    print("payment:",pay)
    addr=pg.evaluate("""()=>{const u=authService.user();const a=addressService.save({userId:u.id,fullName:'T',phone:'1',country:'Nigeria',state:'Lagos',city:'X',street:'Y',postal:'1'});
      const b2=addressService.save({userId:u.id,fullName:'T2',phone:'1',country:'Nigeria',state:'Abuja',city:'X',street:'Y',postal:'1',isDefault:true});
      const defaults=addressService.mine().filter(x=>x.isDefault).length;addressService.remove(b2.id);return {defaultsBefore:defaults,defaultsAfter:addressService.mine().filter(x=>x.isDefault).length}}""")
    print("addresses:",addr)
    nt=pg.evaluate("()=>{const u=authService.user();const n0=notificationService.unread();notificationService.add(u.id,'T','B');const n1=notificationService.unread();notificationService.markAll();return [n0,n1,notificationService.unread()]}")
    print("notifications [before,after add,after markAll]:",nt)
    print("errors:",errs[:5]);b.close()
