require 'shopify_api'
require 'yaml'
require 'date'

SHOP_NAME = ENV["SHOPIFY_SHOP_NAME"]
API_KEY = ENV["SHOPIFY_API_KEY"]
PASSWORD = ENV["SHOPIFY_PASSWORD"]

shop_url = "https://#{API_KEY}:#{PASSWORD}@#{SHOP_NAME}.myshopify.com"
ShopifyAPI::Base.site = shop_url
ShopifyAPI::Base.api_version = '2020-07'

PAGE_ID = 63694438565
PAGE_TITLE = "Menu"

PRODUCT_TYPES = ['Pizza', 'Vegetarian Pizza', 'PanPizza',
                 'Defina Family Style', 'Defina TV Dinners',
                 'Grill', 'Pasta', 'Salad', 'Vegetables', 'Dessert']
PRODUCT_TAGS = { 'GF' => 'Gluten Free', 'V' => 'Vegan', 'Vt' => 'Vegetarian' }

class UpdateMenu
  def self.process
    p = UpdateMenu.new

    content = p.content(PRODUCT_TYPES)
    return unless content

    puts "******************* COMPUTED CONTENT"
    puts content

    page = ShopifyAPI::Page.find(PAGE_ID)
    page.body_html = content
    page.save
    puts "******************* SAVED THE PAGE"
  end

  def content(types)
    prod = products
    puts "******************* PRODUCTS TO CONTENT"
    types.map do |t|
      next unless prod[t]
      section(t, prod[t])
    end.compact.join("\n")
  end

  private

  def format_section(what)
    "<h2 style='color: #ff2a00;'>#{what}</h2>"
  end

  def section(type, products)
    puts "******************* PROCESS SECTION #{type} "
    items = products.map do |product|
      next unless product[:tags].include?('Print')

      t = PRODUCT_TAGS.map do |k, v|
        next unless product[:tags].include?(v)
        k
      end.compact
      t = t.any? ? "(#{t.join(', ')}) " : ""
      "<p><strong>#{product[:name]}</strong> #{product[:desc]} #{t}<strong>$#{product[:price]}</strong></p>"
    end.compact
    items.any? ? "#{format_section(type)}\n" + items.join("\n") : nil
  end

  def products
    puts "******************* GETTING PRODUCTS"
    prods = ShopifyAPI::Product.find(:all)
    all = {}

    puts "******************* SORTING PRODUCTS"
    while prods
      prods.each do |product|
        t = product.product_type
        next if t&.empty?

        all[t] ||= []
        single = { :name => product.title,
                   :desc => product.body_html,
                   :tags => product.tags
                 }
        product.variants.each do |variant|
          single[:name] = variant.title unless variant.title = 'Default Title'
          single[:price] = variant.price
        end
        all[t] << single
      end
      break unless prods.next_page? == true
      prods = prods.fetch_next_page
    end
    all
  end
end

UpdateMenu.process()

