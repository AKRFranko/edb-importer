Feature: Product Data

Converting WORDPRESS/WOOCOMMERCE data to usable program objects 
yields a catalog of products with stocks and counts.

Definitions:

Base Product:      A base product is a simple kind of product with variations ie: MARITIME OTTOMAN, MARITIME 3P
Composite Product: A composite product is a combination of other products ie: MARITIME RAF = MARITIME OTTOMAN + MARITIME 3P

  Scenario: Importing DATA from WORDPRESS/WOOCOMMERCE
    Given WOOCOMMERCE Product Data
     When I import the data
     Then I should have categories and products 
  
  Scenario Outline: A "MARITIME OTTOMAN" has counts
    Given I use a "MARITIME OTTOMAN" as the current product
     Then the current product has a "<key>" of <value>
    Examples: 
      | key        | value | 
      | stockCount | 4     | 
      | cartCount  | 0     | 
  
  Scenario Outline: A "MARITIME 3P" has counts
    Given I use a "MARITIME 3P" as the current product
     Then the current product has a "<key>" of <value>
    Examples: 
      | key        | value | 
      | stockCount | 4     | 
      | cartCount  | 0     | 
  
  Scenario Outline: A "MARITIME RAF" has counts
    Given I use a "MARITIME RAF" as the current product
     Then the current product has a "<key>" of <value>
    Examples: 
      | key        | value | 
      | stockCount | 4     | 
      | cartCount  | 0     | 
  
  Scenario: A "MARITIME OTTOMAN" has choices
    Given I use a "MARITIME OTTOMAN" as the current product
     Then the current product has a "slipcover" choice set to nothing
     Then the current product has a "leg" choice set to nothing
     Then the current product has a "quantity" choice selected as 0
  
  Scenario: A "MARITIME 3P" has choices
    Given I use a "MARITIME 3P" as the current product
     Then the current product has a "slipcover" choice set to nothing
     Then the current product has a "leg" choice set to nothing
     Then the current product has a "quantity" choice selected as 0
  
  Scenario: A "MARITIME RAF" has choices
    Given I use a "MARITIME RAF" as the current product
     Then the current product has a "slipcover" choice set to nothing
     Then the current product has a "leg" choice set to nothing
     Then the current product has a "quantity" choice selected as 0
  
  
