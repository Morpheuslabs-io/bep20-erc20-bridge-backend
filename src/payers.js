"use strict";

const PayerAPI = require("./services/PayerAPI");
const express = require('express');

const app = new express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const payerAPI = new PayerAPI(app);
payerAPI.start();