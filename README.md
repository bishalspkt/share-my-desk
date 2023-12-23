# Share My Desk

[![Build Status](https://travis-ci.com/bishalspkt/share-my-desk.svg?branch=master)](https://travis-ci.com/bishalspkt/share-my-desk)

![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)

## Introduction

This project hosts REST API for Share my Desk app written in Express.js. It allows staff in your office to list their desks as available while they are away for others to use. This enables hotdesking and  effective sharing of desks. This could be useful for growing teams with offices that can't quiet keep up with the rate of growth of the team.

For authentication, this project uses Passport.js library and implements JWT based authentication. Mongoose is used to connect to the data store, MongoDB. In order to generate API documentation, we use RAML.
s
## Getting Started

```bash
# Install npm dependencies
npm install

# Run the app
npm run start

## Testing
npm run test

## Generate RAML docs
npm run ramldoc

```
