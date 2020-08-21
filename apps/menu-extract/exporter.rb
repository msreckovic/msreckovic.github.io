require 'shopify_api'
require 'yaml'
require 'date'

SHOP_NAME = ENV["SHOPIFY_SHOP_NAME"]
API_KEY = ENV["SHOPIFY_API_KEY"]
PASSWORD = ENV["SHOPIFY_PASSWORD"]

ORDERS_START_DATE = '2020-01-26'

shop_url = "https://#{API_KEY}:#{PASSWORD}@#{SHOP_NAME}.myshopify.com"
ShopifyAPI::Base.site = shop_url
ShopifyAPI::Base.api_version = '2020-07'

class PrintProducts
  def self.process
    p = PrintProducts.new

    puts "Initial query sent"
    products = ShopifyAPI::Product.find(:all)
    puts "Initial query done"
    while products do
      p.write(products)
      break unless products.next_page? == true
      puts "Follow up query sent"
      products = products.fetch_next_page
      puts "Follow up query done"
    end
  end

  def write(products)
    puts "HELLO HERE IS PRODUCTS"
    all = []
    products.each do |product|
      single = { :name => product.title,
                 :type => product.product_type,
                 :desc => product.body_html,
                 :vendor => product.vendor }
      product.variants.each do |variant|
        single[:name] = variant.title unless variant.title = 'Default Title'
        single[:price] = variant.price
      end
      all << single
    end
    puts all
  end

  private
end

PrintProducts.process()

