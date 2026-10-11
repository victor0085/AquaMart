PRODUCT PHOTOS
==============
Put real photos in this folder. The site finds them by file name, so no code change is needed.

For every product, use the names listed in IMAGE_LIST.csv (open it in Excel):
  main photo   : <product-name>.jpg        e.g. tecno-spark-40.jpg
  second photo : <product-name>-2.jpg      (optional)
  third photo  : <product-name>-3.jpg      (optional)

- Use .jpg, square or near-square, about 800 x 800 px, under 200 KB each (keeps the site fast on mobile data).
- If a photo is missing, the site automatically shows its generated drawing, so you can add photos a few at a time.
- Only use photos you own, took yourself, or have permission to use (the seller or brand's own product images).
- To use a hosted photo instead, add its full https:// link as a 10th field on the product line in
  js/services/product-service.js:  name|category|brand|price|discount|rating|reviews|stock|emoji|https://...
