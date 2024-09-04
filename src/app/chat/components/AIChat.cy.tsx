import React from 'react'
import AIChat from './AIChat'

describe('<AIChat />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<AIChat />)
  })
})