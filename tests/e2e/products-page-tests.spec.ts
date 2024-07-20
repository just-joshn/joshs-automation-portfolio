import { test, expect } from '@playwright/test'
import { HomePage } from './pages/homePage'
import { ShopMenu } from './pages/shopMenu'
import { ProductsPage } from './pages/productsPage'
import { ProductDetailsPage } from './pages/productDetailsPage'
import { ShoppingCartPage } from './pages/shoppingCartPage'
import { faker } from '@faker-js/faker'

test.beforeEach(async ({ page }) => {
  const homePage = new HomePage(page)
  const shopMenu = new ShopMenu(page)
  const productsPage = new ProductsPage(page)

  await page.goto('/')
  await expect(homePage.productImage.first()).toBeVisible()
  await shopMenu.productsLink.click()
  await expect(productsPage.allProductsHeader).toBeVisible()

  const allProducts = await productsPage.productImageWrapper.all()

  for (const product of allProducts) {
    await expect(product).toBeVisible()
  }
})

test('Verify All Products and product detail page', async ({ page }) => {
  const productDetailsPage = new ProductDetailsPage(page)
  const productsPage = new ProductsPage(page)

  const productName: string = await productsPage.productName.first().innerText()
  const productPrice: string = await productsPage.productPrice.first().innerText()

  await productsPage.viewProductLink.first().click()
  await expect(page).toHaveURL('/product_details/1')
  await expect(productDetailsPage.productName).toHaveText(productName, { useInnerText: true })
  await expect(productDetailsPage.productPrice).toHaveText(productPrice, { useInnerText: true })
  await expect(productDetailsPage.productCategory.getByText('Women > Tops')).toBeVisible()
  await expect(productDetailsPage.productAvailability.getByText('In Stock')).toBeVisible()
  await expect(productDetailsPage.productCondition.getByText('New')).toBeVisible()
  await expect(productDetailsPage.productBrand.getByText('Polo')).toBeVisible()
})

test('Search Product', async ({ page }) => {
  const productsPage = new ProductsPage(page)
  const productCount: number = await productsPage.productImageWrapper.count()
  const randomIndex: number = faker.number.int({ min: 0, max: productCount })
  const productNameText: string = await productsPage.productName.nth(randomIndex).innerText()

  await productsPage.searchInput.fill(productNameText)
  await productsPage.submitSearchButton.click()
  await expect(productsPage.searchedProductsHeader).toBeVisible()

  const productNames = await productsPage.productName.all()

  for (const productName of productNames) {
    await expect(productName).toHaveText(productNameText, { useInnerText: true })
  }
})

test('Add Products in Cart', async ({ page }) => {
  const productsPage = new ProductsPage(page)
  const shoppingCartPage = new ShoppingCartPage(page)
  const productQuantity = '1'
  const firstProductName: string = await productsPage.productName.first().innerText()
  const firstProductPrice: string = await productsPage.productPrice.first().innerText()
  const secondProductName: string = await productsPage.productName.nth(1).innerText()
  const secondProductPrice: string = await productsPage.productPrice.nth(1).innerText()

  await productsPage.productAddToCartLink.first().hover()
  await productsPage.overlayAddToCartLink.first().click()
  await productsPage.continueShoppingButton.click()
  await productsPage.productAddToCartLink.nth(1).hover()
  await productsPage.overlayAddToCartLink.nth(1).click()
  await productsPage.viewCartLink.click()
  await expect(shoppingCartPage.cartProducts).toHaveCount(2)

  await expect(shoppingCartPage.productNames.first()).toHaveText(firstProductName, {
    useInnerText: true,
  })

  await expect(shoppingCartPage.productNames.nth(1)).toHaveText(secondProductName, {
    useInnerText: true,
  })

  await expect(shoppingCartPage.productPrices.first()).toHaveText(firstProductPrice, {
    useInnerText: true,
  })

  await expect(shoppingCartPage.productPrices.nth(1)).toHaveText(secondProductPrice, {
    useInnerText: true,
  })

  await expect(shoppingCartPage.productQuantities.first()).toHaveText(productQuantity, {
    useInnerText: true,
  })

  await expect(shoppingCartPage.productQuantities.nth(1)).toHaveText(productQuantity, {
    useInnerText: true,
  })

  await expect(shoppingCartPage.productTotalPrices.first()).toHaveText(firstProductPrice, {
    useInnerText: true,
  })

  await expect(shoppingCartPage.productTotalPrices.nth(1)).toHaveText(secondProductPrice, {
    useInnerText: true,
  })
})
