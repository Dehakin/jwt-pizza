import { sleep, fail, check } from 'k6'
import http from 'k6/http'
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js'

export const options = {
  cloud: {
    distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 20, duration: '1m' },
        { target: 20, duration: '3m30s' },
        { target: 0, duration: '1m' },
      ],
      gracefulRampDown: '30s',
      exec: 'scenario_1',
    },
  },
}

export function scenario_1() {
  let response

  const vars = {}

  response = http.put(
    'https://pizza-service.pizza329.click/api/auth',
    '{"email":"necro@idk.com","password":"zombie"}',
    {
      headers: {
        'sec-ch-ua-platform': '"Android"',
        'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'Content-Type': 'application/json',
        'sec-ch-ua-mobile': '?1',
      },
    }
  )
  sleep(6.8)

  // check login response code
  check(response, {'status code is 200': response => response.status.toString() === '200'});

  response = http.get('https://pizza-service.pizza329.click/api/order/menu', {
    headers: {
      'sec-ch-ua-platform': '"Android"',
      'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
      'Content-Type': 'application/json',
      'sec-ch-ua-mobile': '?1',
    },
  })

  vars['title1'] = jsonpath.query(response.json(), '$[14].title')[0]

  response = http.get('https://pizza-service.pizza329.click/api/franchise', {
    headers: {
      'sec-ch-ua-platform': '"Android"',
      'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
      'Content-Type': 'application/json',
      'sec-ch-ua-mobile': '?1',
    },
  })
  sleep(14.9)

  response = http.post(
    'https://pizza-service.pizza329.click/api/order',
    `{"items":[{"menuId":2,"description":"Pepperoni","price":0.0042},{"menuId":4,"description":"Crusty","price":0.0028},{"menuId":5,"description":"${vars['title1']}","price":0.0099}],"storeId":"2","franchiseId":1}`,
    {
      headers: {
        'sec-ch-ua-platform': '"Android"',
        'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'Content-Type': 'application/json',
        'sec-ch-ua-mobile': '?1',
      },
    }
  )
  sleep(2.5)
  // check order response code
  check(response, {'status code was 200' : response => response.status.toString() === '200'});

  vars['receivedJwt'] = jsonpath.query(response.json(), '$.jwt')[0];

  response = http.post(
    'https://pizza-factory.cs329.click/api/order/verify',
    {"jwt": `${vars['receivedJwt']}`},
    //'{"jwt":"eyJpYXQiOjE3MzIwODE3MTEsImV4cCI6MTczMjE2ODExMSwiaXNzIjoiY3MzMjkuY2xpY2siLCJhbGciOiJSUzI1NiIsImtpZCI6IjE0bk5YT21jaWt6emlWZWNIcWE1UmMzOENPM1BVSmJuT2MzazJJdEtDZlEifQ.eyJ2ZW5kb3IiOnsiaWQiOiJ6cGVubmV5IiwibmFtZSI6IlphY2ggUGVubmV5In0sImRpbmVyIjp7ImlkIjo0LCJuYW1lIjoiRGVoYWtpbiIsImVtYWlsIjoibmVjcm9AaWRrLmNvbSJ9LCJvcmRlciI6eyJpdGVtcyI6W3sibWVudUlkIjoyLCJkZXNjcmlwdGlvbiI6IlBlcHBlcm9uaSIsInByaWNlIjowLjAwNDJ9LHsibWVudUlkIjo0LCJkZXNjcmlwdGlvbiI6IkNydXN0eSIsInByaWNlIjowLjAwMjh9LHsibWVudUlkIjo1LCJkZXNjcmlwdGlvbiI6IkNoYXJyZWQgTGVvcGFyZCIsInByaWNlIjowLjAwOTl9XSwic3RvcmVJZCI6IjIiLCJmcmFuY2hpc2VJZCI6MSwiaWQiOjQzOH19.jWrV5DjCLKdTCzliyHsIbLxcdW6BPNixgxR1pbsF1zsP4Ex7LXYfFaKljQGTeu7wTV65_NvvqwjPpIkH3CX6KrdG9cCJxEVbUl2EoeKHlKMAtlrs6ievC3qCFUB57zUUQdvKOc55PqVDFFpvAPH5-pyIpgQamIToaLrjJJheq2sbJg2kzFOyQ2erbD3T1dxoiRoZBJhhI7BYxe-5ZQiUySX2X-BTWDOhn0g7m1Eku04bgNb8S6R2GWOcQ0GnjqIqBfq0KodUEv8JtXcc0LbjmT7PeuLpca0Z-o8yvZbeQNVpv6iHiL3PJAmCRUbSbw1_42ucv3u1XG4UqTHCc3lYUyNUH_WCYUW4aCGupoMUVxIn1FOSC3YWtVg6rqVT3KOcBf4-af9oJGLhZK23Ph5I8rWSQwylhRiqK3X-HqjP8EyzTJqY4G2XFxlna3GSAqlu-d_suqkGtpgcSkutAWKJrmznKHt65jTmj0VRwpZBvkZQmUPEqHsR_7lcGCKzeIoe3fjj0YWtLY6Qw4JLkSB0XKImznzJ6mA5x7GI9FmWzRk7pDuJUHgUErtSBnya1HKytIUm56slJS92eT-b8hWWIZw8QlurcYF0xKUmwpFmUQhn6MAudXJL-rJEDhkWjxdeZneaeG-x7h6JTfzoKJKL8krAJ3m0QSnJlUcMxUSvgDQ"}',
    {
      headers: {
        'sec-ch-ua-platform': '"Android"',
        'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'Content-Type': 'application/json',
        'sec-ch-ua-mobile': '?1',
      },
    }
  )
}