import { test, expect } from 'playwright-test-coverage';

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

test('about page', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page.getByRole('main')).toContainText('At JWT Pizza, our amazing employees are the secret behind our delicious pizzas. They are passionate about their craft and spend every waking moment dreaming about how to make our pizzas even better. From selecting the finest ingredients to perfecting the dough and sauce recipes, our employees go above and beyond to ensure the highest quality and taste in every bite. Their dedication and attention to detail make all the difference in creating a truly exceptional pizza experience for our customers. We take pride in our team and their commitment to delivering the best pizza in town.');
  await expect(page.getByRole('main')).toContainText('JamesMariaAnnaBrian');
});

test('history page',  async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');
  await expect(page.getByRole('main')).toContainText('However, it was the Romans who truly popularized pizza-like dishes. They would top their flatbreads with various ingredients such as cheese, honey, and bay leaves.');
});

// response: { user: { id: 2, name: 'pizza diner', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'tttttt' },
test('register new user', async ({ page }) => {
  // mock register and logout
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() == 'POST') {
      const registerRes = {
        user : {
          id : 101,
          name: 'James Raynor',
          email: 'raynor@raiders.rvl',
          roles: [{role : 'diner'}]
        },
        token: 'overdrive'
      }
      await route.fulfill({ json:registerRes });
    }
    else if (route.request().method() == 'DELETE') {
      const logoutRes = {
        message : 'logout successful'
      }
      await route.fulfill({ json:logoutRes });
    }
  });

  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByPlaceholder('Full name').fill('James Raynor');
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('raynor@raiders.rvl');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('sarahkerrigan');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByRole('link', { name: 'JR' })).toBeVisible();
  await expect(page.getByLabel('Global')).toContainText('JR');
  await page.getByRole('link', { name: 'Logout' }).click();
});

test('diner dashboard', async ({ page }) => {
  // mock login
  await page.route('*/**/api/auth', async (route) => {
    const loginRes = {
      user: {
        id : 24,
        name: 'James Raynor',
        email: 'raynor@raiders.rvl',
        roles: [{role: 'diner'}]
      },
      token : 'overdrive'
    };
    await route.fulfill({ json : loginRes });
  });
  // mock a user's orders
  await page.route('*/**/api/order', async (route) => {
    const getOrdersRes = {
      dinerId: 15,
      orders: [
        {
          id : 1,
          franchiseId : 1,
          storeId : 1,
          date: '2433-06-07T06:14:000Z', 
          items: [
            {
              id: 1, 
              menuId : 1,
              description: 'Terran Treat',
              price: 0.10
            },
            {
              id: 2,
              menuId : 1,
              description: 'Mutalisk Wings',
              price: 0.50
            }
          ]
        }
      ],
      page : 1
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: getOrdersRes });
  });

  //response: [{ id: 2, name: 'pizzaPocket', admins: [{ id: 4, name: 'pizza franchisee', email: 'f@jwt.com' }], stores: [{ id: 4, name: 'SLC', totalRevenue: 0 }] }],

  await page.goto('http://localhost:5173/');
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').fill('raynor@raiders.rvl');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('sarahkerrigan');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('link', { name: 'JR' })).toBeVisible();
  await expect(page.getByLabel('Global')).toContainText('JR');

  await page.getByRole('link', { name: 'JR' }).click();
  await expect(page.getByText('Your pizza kitchen')).toBeVisible();
  await expect(page.getByRole('main')).toContainText('name: James Raynoremail: raynor@raiders.rvlrole: diner');
  await expect(page.locator('tbody')).toContainText('2433-06-07T06:14:000Z');
});

test('franchise dashboard', async ({ page }) => {
  // mock this user's franchises
  await page.route('*/**/api/franchise/101', async (route) => {
    console.log("in franchise routing");
    expect(route.request().method()).toBe('GET');
    const getUserFranchisesRes = [{
      id : 12,
      name: 'Planet Char',
      admins: [
        {
          id : 17,
          name: 'Zagara',
          email: 'zaggy@jwt.com'
        },
        {
          id: 101,
          name: 'James Raynor',
          email: 'raynor@raiders.rvl'
        }
      ],
      stores : [
        {
          id : 190,
          name: 'The Pizza Trench',
          totalRevenue: 431
        },
        {
          id : 189,
          name: 'Warfield Palace',
          totalRevenue: 203
        }
      ]
    }];
    await route.fulfill({ json:getUserFranchisesRes });
  });

  // mock login
  await page.route('*/**/api/auth', async (route) => {
    const loginRes = {
      user: {
        id : 101,
        name: 'James Raynor',
        email: 'raynor@raiders.rvl',
        roles: [{role: 'diner'}]
      },
      token : 'overdrive'
    };
    await route.fulfill({ json : loginRes });
  });

  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').fill('raynor@raiders.rvl');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('sarahkerrigan');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();

  await expect(page.getByRole('main')).toContainText('Everything you need to run an JWT Pizza franchise. Your gateway to success.');
  await expect(page.getByRole('button', { name: 'Create store' })).toBeVisible();

  await expect(page.getByRole('heading')).toContainText('Planet Char');
  await expect(page.getByRole('button', { name: 'Create store' })).toBeVisible();
  await expect(page.locator('tbody')).toContainText('The Pizza Trench');
});

test('purchase with login', async ({ page }) => {
  // mock get menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
      { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // mock get franchises
  await page.route('*/**/api/franchise', async (route) => {
    const franchiseRes = [
      {
        id: 2,
        name: 'LotaPizza',
        stores: [
          { id: 4, name: 'Lehi' },
          { id: 5, name: 'Springville' },
          { id: 6, name: 'American Fork' },
        ],
      },
      { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
      { id: 4, name: 'topSpot', stores: [] },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  // z: mock diner login
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'd@jwt.com', password: 'a' };
    const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  // mock make order
  await page.route('*/**/api/order', async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: 'Veggie', price: 0.0038 },
        { menuId: 2, description: 'Pepperoni', price: 0.0042 },
      ],
      storeId: '4',
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
        id: 23,
      },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(orderReq);
    await route.fulfill({ json: orderRes });
  });

  await page.goto('/');

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});

// My tests
test('admin creates franchise', async ({ page }) => {
  // mock admin login
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = {email: 'a@jwt.com', password: 'admin'};
    const loginRes = {user: { id : 3, name: 'Sarah Kerrigan', email: 'a@jwt.com', roles: [{role: 'admin'}]}, token:'iamtheswarm'};
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json:loginRes });
  });

  let count = 0;
  // mock get franchises
  await page.route('*/**/api/franchise', async (route) => {
    const method = route.request().method();
    // mock out get franchise request for first time (without Planet Char)
    if (method === 'GET' && count === 0) {
      const franchiseRes = [
        {
          id: 2,
          name: 'LotaPizza',
          admins : [{id:3, name:"Mr. Ignacio Lota", email:'ignacio@jwt.com'}],
          stores: [
            { id: 4, name: 'Lehi', totalRevenue: 21 },
            { id: 5, name: 'Springville', totalRevenue: 27 },
            { id: 6, name: 'American Fork', totalRevenue: 103 },
          ],
        },
        { id: 3, 
          name: 'PizzaCorp', 
          admins: [{id:17, name:"The Pizza Man", email: "pizzaman@jwt.com"}],
          stores: [{ id: 7, name: 'Spanish Fork', totalRevenue : 54 }] }
      ];
      count += 1;
      await route.fulfill({ json: franchiseRes });
    }
    // mock out for second time
    else if (method === 'GET' && count === 1) {
      const franchiseRes = [
        {
          id: 2,
          name: 'LotaPizza',
          admins : [{id:3, name:"Mr. Ignacio Lota", email:'ignacio@jwt.com'}],
          stores: [
            { id: 4, name: 'Lehi', totalRevenue: 21 },
            { id: 5, name: 'Springville', totalRevenue: 27 },
            { id: 6, name: 'American Fork', totalRevenue: 103 },
          ],
        },
        { 
          id: 3, 
          name: 'PizzaCorp', 
          admins: [{id:17, name:'The Pizza Man', email: 'pizzaman@jwt.com'}],
          stores: [{ id: 7, name: 'Spanish Fork', totalRevenue : 54 }] 
        },
        {
          id: 4,
          name:'Planet Char',
          admins: [{id: 18, name:'Zagara', email:'zaggy@jwt.com'}],
          stores: []
        }
      ];
      await route.fulfill({ json: franchiseRes });
    }
    else if (method === 'POST') {
      // mock out post request
      const makeFranchiseRes = [{
         name: 'Planet Char', admins: [{ email: 'zaggy@jwt.com', id: 18, name: 'Zagara' }], id: 1
      }];
      await route.fulfill({ json:makeFranchiseRes });
    }
    else {
      expect('method error').toBe(1);
    }
  });
  
  // mock make a franchise
  // await page.route('*/**/api/franchise', async (route) => {
  //   const createFranchiseRes = { name: 'Planet Char', admins: [{email: "zaggy@jwt.com", id:4, name: "Zagara"}], id: 16 };
  //   expect(route.request().method()).toBe("POST");
  //   await route.fulfill({ json: createFranchiseRes });
  // });

  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('a@jwt.com');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  // problem (probably having trouble showing franchise stuff)
  await page.getByRole('link', { name: 'Admin' }).click();

  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByPlaceholder('franchise name').click();
  await page.getByPlaceholder('franchise name').fill('Planet Char');
  await page.getByPlaceholder('franchisee admin email').click();
  await page.getByPlaceholder('franchisee admin email').fill('zaggy@jwt.com');

  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page.getByRole('table')).toContainText('Planet Char');
  await expect(page.getByRole('table')).toContainText('Zagara');
});

/*test('foo', async ({ page }) => {
  await page.getByRole('link', { name: 'Admin' }).click();
});*/