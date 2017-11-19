Feature: Product Choices

Products have choices that can be selected.
Changing choices should change stock/cart counts.
Adding/Removing items from cart change stock/cart counts.

Definitions:

Base Product:      A base product is a simple kind of product with variations ie: MARITIME OTTOMAN, MARITIME 3P
Composite Product: A composite product is a combination of other products ie: MARITIME RAF = MARITIME OTTOMAN + MARITIME 3P

  Scenario: A "MARITIME OTTOMAN" updates counts when something is selected
    Given I use a "MARITIME OTTOMAN" as the current product
      And I choose a "slipcover" named "slipcover-003"
     Then the current product has a "slipcover" choice selected as "slipcover-003"
     Then the current product has a "quantity" choice selected as 0
     Then the current product has a "stockCount" of 1
     Then the current product has a "cartCount" of 0
  
  Scenario: A "MARITIME OTTOMAN" updates counts when a quantity is selected
    Given I use a "MARITIME OTTOMAN" as the current product
      And I choose a "slipcover" named "slipcover-003"
      And I choose a "quantity" of 1
     Then the current product has a "slipcover" choice selected as "slipcover-003"
     Then the current product has a "quantity" choice selected as 1
     Then the current product has a "stockCount" of 0
     Then the current product has a "cartCount" of 0
  
  Scenario: when the user views a different product, selections on current product should be reset
    Given I use a "MARITIME RAF" as the current product
      And the parent "MARITIME OTTOMAN" has a "quantity" choice selected as 0
      And the parent "MARITIME OTTOMAN" has a "slipcover" choice set to nothing
      And the parent "MARITIME OTTOMAN" has a "leg" choice set to nothing
      And the parent "MARITIME OTTOMAN" has a stock of 4
      And the parent "MARITIME OTTOMAN" has a cart of 0
     Then the current stock count is 4
     Then the current cart count is 0
  
  Scenario: A "MARITIME RAF" updates counts when selected/added
    Given I use a "MARITIME RAF" as the current product
      And I choose a "slipcover" named "slipcover-003"
      And I choose a "leg" named "leg-001"
      And the current stock count is 1
      And the current cart count is 0
      And the parent "MARITIME OTTOMAN" has a "quantity" choice selected as 0
      And the parent "MARITIME 3P" has a "quantity" choice selected as 0
      And I choose a "quantity" of 1
     Then the current product has a "slipcover" choice selected as "slipcover-003"
     Then the current product has a "quantity" choice selected as 1
     Then the current product has a "stockCount" of 0
     Then the current product has a "cartCount" of 0
  
  Scenario: A "MARITIME OTTOMAN" cannot be added to cart if it's missing options
    Given I use a "MARITIME OTTOMAN" as the current product
     When I have no leg options selected
     Then the current product has a "leg" choice set to nothing
     Then addToCart returns an error
  
  Scenario: A "MARITIME RAF" can be added to cart
    Given I use a "MARITIME RAF" as the current product
      And I choose a "slipcover" named "slipcover-003"
      And I choose a "leg" named "leg-001"
      And the current stock count is 1
      And the current cart count is 0
      And the parent "MARITIME OTTOMAN" has a "quantity" choice selected as 0
      And the parent "MARITIME 3P" has a "quantity" choice selected as 0
      And the current stock count is 1
      And I choose a "quantity" of 1    
      And the current cart count is 0
     Then addToCart returns true
     Then the current product has a "slipcover" choice set to nothing
     Then the current product has a "quantity" choice selected as 0
  # stock count is 3 because selctions are reset
     Then the current product has a "stockCount" of 3
     Then the current product has a "cartCount" of 1  
  
  Scenario: A "MARITIME OTTOMAN" can be added to cart
    Given I use a "MARITIME OTTOMAN" as the current product
      And I choose a "slipcover" named "slipcover-003"
      And I choose a "leg" named "leg-001"
      And I choose a "quantity" of 1
     Then addToCart returns true
     Then the current product has a "slipcover" choice set to nothing
     Then the current product has a "quantity" choice selected as 0
     Then the current product has a "stockCount" of 2
     Then the current product has a "cartCount" of 2
  
  Scenario: A "MARITIME 3P" can be added to cart
    Given I use a "MARITIME 3P" as the current product
      And the current stock count is 3
      And the current cart count is 1
      And I choose a "slipcover" named "slipcover-003"
      And I choose a "leg" named "leg-001"
      And I choose a "quantity" of 1
      And the current stock count is -1
     Then addToCart returns true
     Then the current product has a "slipcover" choice set to nothing
     Then the current product has a "quantity" choice selected as 0
     Then the current product has a "stockCount" of 2
     Then the current product has a "cartCount" of 2
  
  Scenario: Cart items should now exist in the cart.
    Given I have a cart
     Then the cart has items
  
  Scenario: Cart items have quantities
    Given I have a cart
      And the cart has items
      And I set the first cart item as the current cart item
     Then the cart has a "itemCount" of 3
     Then the cart has a "productCount" of 3
     Then the current cart item has a "quantity" choice of 1
  
  Scenario: Cart items can have quantities manipulated
    Given I have a cart
      And the cart has items
      And I set the first cart item as the current cart item
     When I increase the current cart item by 2
     Then the current cart item has a "quantity" choice of 3
  
  Scenario: Cart items can be removed
    Given I have a cart
      And the cart has items
      And I set the first cart item as the current cart item
     When I remove the current cart item
     Then the cart has a "itemCount" of 2
     Then the cart has a "productCount" of 2
  
  Scenario: Cart items can be removed
    Given I have a cart
      And the cart has items
      And I set the last cart item as the current cart item
     When I remove the current cart item
     Then the cart has a "itemCount" of 1
     Then the cart has a "productCount" of 1
  
  
