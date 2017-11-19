Feature: Cart Pricing With Special Rates
  
  The cart can have special rates for some members,
  these should be included in the calculations
  when avaialable.
  
  Background: 
    Given I have a cart
      And I reset the cart
      And the cart has a "itemCount" of 0
      And I use a "MARITIME OTTOMAN" as the current product
      And I choose a "slipcover" named "slipcover-003"
      And I choose a "leg" named "leg-001"
      And I choose a "quantity" of 1
      And addToCart returns true
      And I use a "MARITIME 3P" as the current product 
      And I choose a "slipcover" named "slipcover-003"
      And I choose a "leg" named "leg-001"
      And I choose a "quantity" of 1
      And addToCart returns true
      And the cart has a "itemCount" of 2
      And I set the zone to "zone-1"
      And the cart has a "itemCost" of $1425
      And the cart has a "shippingCost" of $0
      And the cart has a "taxCost" of $213.75
      And the initial cart total is $1638.75
      
Scenario: A VIP user has 5% of regular products
  Given it's a VIP user
   Then the cart has a "discountCost" of $-71.25
   Then the cart has a "total" of $1567.5
   
Scenario: A VVIP user has 10% of regular products
   Given it's a VVIP user
   Then the cart has a "discountCost" of $-142.5
   Then the cart has a "total" of $1496.25
   
Scenario: A VVVIP user has 15% of regular products
   Given it's a VVVIP user
   Then the cart has a "discountCost" of $-213.75
   Then the cart has a "total" of $1425
 
Scenario: A NORMAL user has 0% of regular products
  Given it's a NORMAL user
   Then the cart has a "discountCost" of $0
   Then the cart has a "total" of $1638.75
