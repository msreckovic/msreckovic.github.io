require 'shopify_api'
require 'yaml'
require 'date'

SHOP_NAME = ENV["SHOPIFY_SHOP_NAME"]
API_KEY = ENV["SHOPIFY_API_KEY"]
PASSWORD = ENV["SHOPIFY_PASSWORD"]

CUSTOMER = '717287358566'


shop_url = "https://#{API_KEY}:#{PASSWORD}@#{SHOP_NAME}.myshopify.com"
ShopifyAPI::Base.site = shop_url
ShopifyAPI::Base.api_version = '2020-04'

# orders = ShopifyAPI::Order.find(:all, params: { status: 'any', created_at_min: since, limit: 250 })

draft_order = ShopifyAPI::DraftOrder.create(
  line_items: [
    { title: "Test Order Custom Item",
      price: 0.00,
      quantity: 1,
    }
  ],
  customer: {
    first_name: "Paul",
    last_name: "Norman",
    email: "paul.norman@example.com",
  },
  billing_address: {
    first_name: "John",
    last_name: "Smith",
    address1: "123 Fake Street",
    phone: "555-555-5555",
    city: "Fakecity",
    province: "Ontario",
    country: "Canada",
    zip: "K2P 1L4",
  },
  shipping_address: {
    first_name: "Jane",
    last_name: "Smith",
    address1: "123 Fake Street",
    phone: "777-777-7777",
    city: "Fakecity",
    province: "Ontario",
    country: "Canada",
    zip: "K2P 1L4"
  },
  email: "jane@example.com"
)

5 13 4 2 - outside

41 2 5 3 - inside door - match 5 13 4 2
