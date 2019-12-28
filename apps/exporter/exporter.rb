require 'shopify_api'
require 'yaml'
require 'date'

SHOP_NAME = ENV["SHOPIFY_SHOP_NAME"]
API_KEY = ENV["SHOPIFY_API_KEY"]
PASSWORD = ENV["SHOPIFY_PASSWORD"]

shop_url = "https://#{API_KEY}:#{PASSWORD}@#{SHOP_NAME}.myshopify.com"
ShopifyAPI::Base.site = shop_url
ShopifyAPI::Base.api_version = '2019-10'

class PrintOrders
  HEADER = [
    "Order", "When",
    "Name", "First Name", "Last Name", "Contact E-Mail(s)", "Contact Phone(s)",

    "Affiliation (select Club if unsure)",

    "Item", "Variation", "Amount",

    "Payer Name" ,"Payer E-Mail" ,"Order Note",

    "Emergency Contact(s)", "Emergency Phone(s)", "Emergency E-Mail(s)",

    "Parent(s) or Guardian(s)",
    "Additional Information (alergies, other medical info, etc.)",


    "Camper's Name",
    "Camper's Age",
    "Which 2020 Camp Argo Week did you register for?",
    "Swimming Ability", "Rowing Experience",

    "Access Card Number", "Locker Number", "Boat Name", "Rack Number",
    "I'm interested in helping with...",
    "What prompted you to consider learn to row?  How did you hear about this program?",

    "This member is 19 or older",
    "AgreeMembership",
    "AgreeConcussion",
    "AgreePhoto",
    "AgreeOffsite",
    "Registered with Rowing Canada",
    "AlreadyClubMember",
  ]

  LEGACY_PROPERTIES = {
    "Access Card" => "Access Card Number",
    "Active E-Mail" => "Contact E-Mail(s)",
    "Contact E-Mail" => "Contact E-Mail(s)",
    "Contact Phone" => "Contact Phone(s)",
    "I'm interesting in helping with..." => "I'm interested in helping with...",
    "Member's Name" => "Name",
  }

  ITEMS_MEMBERSHIP = ["2020 Adult Membership",
                      "2020 Junior (High School) Membership",
                      "2020 Alumni/Social Membership",
                      "2020 Learn To Train",
                      "2020 Para Membership",
                      "2020 National Team Members Membership",
                      "2020 Senior Masters >65 years old",
                      "2020 University Membership",
                      "2020 Winter (non-rowing) Membership",
                      "2020 Boat Storage",
                      "2020 Lockers",

                      "2019 Winter (non-rowing) Membership",
                     ]

  def self.process(filename, since, filters)
    p = PrintOrders.new

    puts "Initial query sent"
    orders = ShopifyAPI::Order.find(:all, params: { status: 'any', created_at_min: since, limit: 250 })
    puts "Initial query done"
    p.open(filename)
    while orders do
      p.write(orders, filters)
      break unless orders.next_page? == true
      puts "Follow up query sent"
      orders = orders.fetch_next_page
      puts "Follow up query done"
    end
    p.close
  end

  def open(filename)
    @f = File.open(filename, 'w')
    write_header
  end

  def write(orders, filters)
    write_body(process_orders(orders, filters))
  end

  def close
    @f.close
  end

  private

  def write_header
    @f.puts(HEADER.map { |x| fix_for_csv(x) }.join("\t"))
  end

  def write_body(orders)
    orders.each do |order|
      t = HEADER.map do |thing|
        fix_for_csv(order[thing])
      end
      @f.puts t.join("\t")
    end
  end

  def process_orders(orders, filters)
    total = []
    orders.each do |order|
      pname = [order.customer.first_name, order.customer.last_name].join(' ')
      pemail = order.customer.email
      pnote = order.note
      pnote = pnote.gsub("\n", ' ') if pnote
      pnote = pnote.gsub("\r", ' ') if pnote
      pnote = pnote.gsub(",", ' ') if pnote

      payer = {
        'Order' => order.name,
        'When' => Date.parse(order.created_at).to_s,
        'Payer Name' => pname,
        'Payer E-Mail' => pemail,
        'Order Note' => pnote,
      }

      order.line_items.each do |item|
        next unless filters.nil? || filters.include?(item.title)

        title = item.title
        variant = item.variant_title

        one = {
          'Item' => title,
          'Variation' => variant,
          'Amount' => "= #{item.quantity} * #{item.price}",
        }

        props = convert_properties(item.properties)

        extra = additional_properties(item, variant, props)

        combined = payer.merge(one)
        combined = combined.merge(props)
        combined = combined.merge(extra)

        total << combined
      end
    end
    total
  end

  private

  def additional_properties(item, variant, props)
    first_name, last_name = split_name(props["Name"]) if props["Name"]
    first_name, last_name = split_name(props["Camper's Name"]) if props["Camper's Name"]
    extra = { "First Name" => first_name, "Last Name" => last_name }

    if item.downcase.include?("junior")
      extra["Affiliation (select Club if unsure)"] = "Junior" 
    elsif item.downcase.include?("learn") && item.downcase.include?("train")
      extra["Affiliation (select Club if unsure)"] = "LTT"
    elsif item.downcase.include?("learn") && item.downcase.include?("row")
      extra["Affiliation (select Club if unsure)"] = "LTR"
    end

    extra
  end

  def split_name(what)
    s = what.split(' ')
    [s[0], s.slice(1, s.size).join(' ')]
  end

  def convert_properties(properties)
    properties.map do |p|
      prop_name = p.attributes['name']
      prop_name = prop_name.slice(1, prop_name.size) if prop_name[0] == "_"
      prop_name = LEGACY_PROPERTIES[prop_name] || prop_name
      puts "COMPLAINING ABOUT #{prop_name}" unless HEADER.include?(prop_name)

      prop_value = p.attributes['value']

      [prop_name, prop_value]
    end.to_h
  end

  def fix_for_csv(value)
    unless value.nil? || value.empty?
      return "'#{value}'" if value.include?("\t")
    end
    value
  end
end

PrintOrders.process("/Users/Milan/shopify_store_export.csv", '2019-10-01', PrintOrders::ITEMS_MEMBERSHIP)

