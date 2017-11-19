Feature: Cart Pricing

Prices should be consistent based on quantities and location (the taxes are all set to 0.15 in these tests )

  Background: 
    Given I have a cart
      And the cart has items
      And I set the first cart item as the current cart item
      
  Scenario: Cart items have prices (using MARITIME OTTOMAN added in cart from another scenario)
  
    Given the current cart item has a "quantity" choice of 1 
     Then the current cart item has a "minRegularPrice" of $300 
     Then the current cart item has a "maxRegularPrice" of $425
     Then the current cart item has a "minPrice" of $300
     Then the current cart item has a "maxPrice" of $425
     Then the current cart item has a "itemCost" of $425
     Then the cart has a "itemCost" of $425
     Then the cart has a "shippingCost" of "n/a"
     Then the cart has a "taxCost" of "n/a"
     Then the cart has a "total" of "n/a"
  
  Scenario: Cart items multiply prices based on quantity (using MARITIME OTTOMAN added from another scenario)
    Given the current cart item has a "quantity" choice of 1 
      And I increase the current cart item by 2
      And the current cart item has a "quantity" choice of 3
     Then the current cart item has a "minRegularPrice" of $900 
     Then the current cart item has a "maxRegularPrice" of $1275
     Then the current cart item has a "minPrice" of $900
     Then the current cart item has a "maxPrice" of $1275
     Then the current cart item has a "itemCost" of $1275
     Then the cart has a "itemCost" of $1275
     Then the cart has a "shippingCost" of "n/a"
     Then the cart has a "taxCost" of "n/a"
     Then the cart has a "total" of "n/a"
  
  Scenario: The cart shipping cost changes when I set a zone (above minimum)
    Given the current cart item has a "quantity" choice of 3 
     When I set the zone to "zone-1"
     Then the cart has a "shippingCost" of $0 
     Then the cart has a "taxCost" of $191.25
     Then the cart has a "total" of $1466.25
  
  Scenario: The cart shipping cost changes when I change to zone 1 (above minimum)
    Given I set the zone to "zone-2"
     Then the cart has a "shippingCost" of $85
     Then the cart has a "taxCost" of $191.25
     Then the cart has a "total" of $1551.25
     
  Scenario: The cart shipping cost changes when I change to zone 2 (above minimum)
    Given I set the zone to "zone-3"
     Then the cart has a "shippingCost" of $150
     Then the cart has a "taxCost" of $191.25
     Then the cart has a "total" of $1616.25
  
  Scenario: The cart shipping cost changes when I change to zone 1 (below minimum)
    Given the current cart item has a "quantity" choice of 3
      And I decrease the current cart item by 2
      And I set the zone to "zone-1"
     Then the cart has a "shippingCost" of $65
     Then the cart has a "taxCost" of $63.75
     Then the cart has a "total" of $553.75
  
  Scenario: The cart shipping cost changes when I change zone 2 (below minimum)
     When I set the zone to "zone-2"
     Then the cart has a "shippingCost" of $150
     Then the cart has a "taxCost" of $63.75
     Then the cart has a "total" of $638.75
  
  Scenario: The cart shipping cost changes when I change zone 3 (below minimum)
     When I set the zone to "zone-3"
     Then the cart has a "shippingCost" of $250
     Then the cart has a "taxCost" of $63.75
     Then the cart has a "total" of $738.75
     
  Scenario: A cart knows nothing about shipping and taxes if it has no postal code
    
    Given I reset the zone to nothing
      And I do not provide a postal code
     Then the cart has a "shippingZone" of "n/a"
  
  Scenario: A cart knows the shipping taxes and zone for a postal code
    
    Given I provide a postal code of "H2A 2A2"
     Then the cart has a "shippingZone" of "zone-1"
     Then the cart has a "taxCost" of $63.75
  
  Scenario: A cart knows the shipping taxes and zone for a postal code
    Given I provide a postal code of "Z0R 1M2"
     Then the cart has a "shippingZone" of "zone-2"
     Then the cart has a "taxCost" of $63.75
  
  Scenario: A cart knows the shipping taxes and zone for a postal code
    Given I provide a postal code of "J07 2B4"
     Then the cart has a "shippingZone" of "zone-3"
     Then the cart has a "taxCost" of $63.75
  
  Scenario: A cart can have it's zone cleared
    Given I reset the zone to nothing
     Then the cart has a "shippingZone" of "n/a"
     Then the cart has a "taxCost" of "n/a"
  
  