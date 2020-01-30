(async () => {

const Cube = require('seacreature/analytics/cube')
const data = {
  Orders: [
    { Id: 'Bob Beer', ProductId: 'Beer' },
    { Id: 'Bruce Beer', ProductId: 'Beer' },
    { Id: 'Mary Oranges', ProductId: 'Oranges' },
    { Id: 'Sue Apples', ProductId: 'Apples' }
  ],
  Products: [
    { Id: 'Beer', SupplierId: 'Bottle-O' },
    { Id: 'Oranges', SupplierId: 'Vege Bin' },
    { Id: 'Apples', SupplierId: 'Vege Bin' }
  ],
  Suppliers: [
    { Id: 'Bottle-O' },
    { Id: 'Vege Bin' }
  ]
}

const suppliers = Cube(s => s.Id)
const supplier_byid = suppliers.range_single(s => s.Id)
const supplier_byproduct = suppliers.link_multiple(s => product_bysupplier.lookup(s.Id))

const products = Cube(p => p.Id)
const product_byid = products.range_single(p => p.Id)
const product_bysupplier = products.link_single(p => p.SupplierId)
const product_byorder = products.link_multiple(p => order_byproduct.lookup(p.Id))

const orders = Cube(o => o.Id)
const order_byid = orders.range_single(o => o.Id)
const order_byproduct = orders.link_single(o => o.ProductId)

products.link_to(suppliers, supplier_byproduct)
suppliers.link_to(products, product_bysupplier)
products.link_to(orders, order_byproduct)
orders.link_to(products, product_byorder)

const orders_indicies = await orders.batch({ put: data.Orders })
const products_indicies = await products.batch({ put: data.Products })
const suppliers_indicies = await suppliers.batch({ put: data.Suppliers })
await suppliers.batch_calculate_selection_change(suppliers_indicies)
await products.batch_calculate_selection_change(products_indicies)
await orders.batch_calculate_selection_change(orders_indicies)

const print = msg => {
  console.log('*********', msg)
  console.log('O', Array.from(orders, id =>
    `${id}:${orders.refcount.get(orders.id2i(id))}`).join(', '))
  console.log('P', Array.from(products, id =>
    `${id}:${products.refcount.get(products.id2i(id))}`).join(', '))
  console.log('S', Array.from(suppliers, id =>
    `${id}:${suppliers.refcount.get(suppliers.id2i(id))}`).join(', '))
  console.log('*********', msg)
}

// Scenario 2
print()
await order_byid('Bob Beer')
print('order_byid(Bob Beer)')
// await supplier_byid('Bottle-O')
// print('supplier_byid(Bottle-O)')
// await product_byid('Beer')
// print('product_byid(Beer)')
// await order_byid(null)
// print('order_byid(null)')
// await supplier_byid(null)
// print('supplier_byid(null)')

})()