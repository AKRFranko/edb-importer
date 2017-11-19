Feature: Product Pricing

Prices should be consistent based on user choices. (the taxes are all set to 0.15 in these tests )
#   Products, the cart, and cart items should have some initial pricing values and 
#   those values should change on interaction with the interface. 
# 

# Definitions:

#   minRegularPrice: Minimum regular price for any option 
#   maxRegularPrice: Maximum regular price for any option
#   minSalePrice:    Minimum sale price for any option 
#   maxSalePrice:    Maximum sale price for any option 
#   minPrice:        Minimum sale price for any option or current option if selected
#   maxPrice:        Minimum sale price for any option or current option if selected
#   currentPrice:    Calculated price base on selected choices
#   basePrice:       Minimum sale price for any option or current option if selected

  Scenario: Items in the catalog have prices
    Given I use a "MARITIME OTTOMAN" as the current product
     Then the current product has a "minRegularPrice" number
     Then the current product has a "maxRegularPrice" number
     Then the current product has a "minSalePrice" number
     Then the current product has a "maxSalePrice" number
     Then the current product has a "minPrice" number
     Then the current product has a "maxPrice" number
  
  Scenario: Base items in the catalog have prices (not testing sales prices yet..)
    Given I use a "MARITIME OTTOMAN" as the current product
      And I know that the current product has a base price of $300
      And I know that the cheapest leg is "leg-002" at $0
      And I know that the most expensive leg is "leg-001" at $25
      And I know that the cheapest slipcover is "slipcover-006" at $0
      And I know that the most expensive slipcover is "slipcover-003" at $100
     Then the current product has a "minRegularPrice" of $300
     Then the current product has a "maxRegularPrice" of $425
  # Then the current product has a "minSalePrice" of $300
  # Then the current product has a "maxSalePrice" of $425
     Then the current product has a "minPrice" of $300
     Then the current product has a "maxPrice" of $425
  
  Scenario: Base items in the catalog have prices (not testing sales prices yet..)
    Given I use a "MARITIME 3P" as the current product
      And I know that the current product has a base price of $900
      And I know that the cheapest leg is "leg-002" at $0
      And I know that the most expensive leg is "leg-001" at $25
      And I know that the cheapest slipcover is "slipcover-006" at $0
      And I know that the most expensive slipcover is "slipcover-003" at $150
     Then the current product has a "minRegularPrice" of $900
     Then the current product has a "maxRegularPrice" of $1075
  # Then the current product has a "minSalePrice" of $900
  # Then the current product has a "maxSalePrice" of $1075
     Then the current product has a "minPrice" of $900
     Then the current product has a "maxPrice" of $1075
     Then the current product has a "currentPrice" of $900
  
  Scenario: Base items in the catalog change prices when selections are made (not testing sales prices yet..)
    Given I use a "MARITIME 3P" as the current product
      And I know that the current product has a base price of $900
      And I know that the most expensive leg is "leg-001" at $25
      And I know that the cheapest slipcover is "slipcover-006" at $0
      And I choose a "slipcover" named "slipcover-006"
     Then the current product has a "minRegularPrice" of $900
     Then the current product has a "maxRegularPrice" of $1075
     Then the current product has a "currentPrice" of $900
     When I choose a "leg" named "leg-001"
     Then the current product has a "currentPrice" of $925
  
  Scenario: Composite items in the catalog have prices (not testing sales prices yet..)
    Given I use a "MARITIME RAF" as the current product
      And I know that the current product has a base price of $1200
      And I know that the cheapest leg is "leg-002" at $0
      And I know that the most expensive leg is "leg-001" at $50
      And I know that the cheapest slipcover is "slipcover-006" at $0
      And I know that the most expensive slipcover is "slipcover-003" at $250
     Then the current product has a "minRegularPrice" of $1200
     Then the current product has a "maxRegularPrice" of $1500
  # Then the current product has a "minSalePrice" of $900
  # Then the current product has a "maxSalePrice" of $1025
     Then the current product has a "minPrice" of $1200
     Then the current product has a "maxPrice" of $1500
  
