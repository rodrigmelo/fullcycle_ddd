import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("Should find a order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("1", "customerName1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("2", "productName1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "3",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("4", "1", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const findOrder = await orderRepository.find("4");

    expect(order).toStrictEqual(findOrder);
  });

  it("Should update a order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("1", "customerName1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("2", "productName1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "3",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("4", "1", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const findOrder = await orderRepository.find("4");

    const productToUpdate = new Product("3", "productName2", 20);
    await productRepository.create(productToUpdate);

    const orderItemToUpdate = new OrderItem(
      "4",
      productToUpdate.name,
      productToUpdate.price,
      productToUpdate.id,
      2
    );

    findOrder.changeItems([orderItemToUpdate]);

    await orderRepository.update(findOrder);

    const orderUpdated = await OrderModel.findOne({
      where: { id: "4" },
      include: [{ model: OrderItemModel }],
    });

    expect(orderUpdated.toJSON()).toStrictEqual({
      id: findOrder.id,
      customer_id: findOrder.customerId,
      total: findOrder.total(),
      items: [
        {
          id: findOrder.items[0].id,
          name: findOrder.items[0].name,
          price: findOrder.items[0].price,
          product_id: findOrder.items[0].productId,
          quantity: findOrder.items[0].quantity,
          order_id: order.id,
        },
      ],
    });
  });

  it("Should find all orders", async () => {
    const customerRepository = new CustomerRepository();
    const productRepository = new ProductRepository();
    const orderRepository = new OrderRepository();

    const customer = new Customer("123", "Customer 1");

    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const customer2 = new Customer("1234", "Customer 2");
    const address2 = new Address("Street 2", 2, "Zipcode 2", "City 2");
    customer2.changeAddress(address2);
    await customerRepository.create(customer2);

    const product = new Product("12345", "Product 1", 10);
    await productRepository.create(product);

    const product2 = new Product("12346", "Product 2", 20);
    await productRepository.create(product2);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const orderItem2 = new OrderItem(
      "2",
      product2.name,
      product2.price,
      product2.id,
      4
    );

    const order = new Order("987", "123", [orderItem]);
    const order2 = new Order("654", "1234", [orderItem2]);

    await orderRepository.create(order);
    await orderRepository.create(order2);

    const allOrders = await orderRepository.findAll();

    expect(allOrders).toContainEqual(order);
    expect(allOrders).toContainEqual(order2);
  });
});
