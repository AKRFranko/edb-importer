Feature: Cart Pricing With Coupons
  
  The cart can have coupons,
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
      
Scenario: A coupon can be applied
  Given a coupon for %15 off regular products
    And the cart has a "total" of $1638.75
   When the coupon for %15 is applied
   Then the cart has discounts including 0.15
   Then the cart has a "discountCost" of $-213.75
   Then the cart has a "total" of $1425
   
Scenario: Another coupon can also be applied
  Given a coupon for %10 off regular products
    And the cart has a "total" of $1425
  When the coupon for %10 is applied
  Then the cart has discounts including 0.10
  Then the cart has discounts including 0.15
  Then the cart has a "discountCost" of $-356.25
  Then the cart has a "total" of $1282.5

Scenario: a coupon can be removed
  Given a coupon for %10 off regular products
    And the cart has a "total" of $1282.5
  When the coupon for %10 is removed
  Then the cart has no discounts including 0.10
  Then the cart has discounts including 0.15
  Then the cart has a "discountCost" of $-213.75
  Then the cart has a "total" of $1425

Scenario: another coupon can be removed
  Given a coupon for %15 off regular products
    And the cart has a "total" of $1425
  When the coupon for %15 is removed
  Then the cart has no discounts including 0.10
  Then the cart has no discounts including 0.15
  Then the cart has a "discountCost" of $0
  Then the cart has a "total" of $1638.75

