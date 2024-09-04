/// <reference types="cypress" />

describe('Flow Component', () => {
    beforeEach(() => {
      cy.visit('flow');
      cy.get('body').should('be.visible'); // Wait for the page to load
      cy.intercept('GET', '/api/flows*', { fixture: 'flows.json' }).as('getFlows');
      cy.intercept('POST', '/api/flows', { statusCode: 201, fixture: 'newFlow.json' }).as('createFlow');
      cy.intercept('PUT', '/api/flows/*', { statusCode: 200, fixture: 'updatedFlow.json' }).as('updateFlow');
      cy.intercept('DELETE', '/api/flows/*', { statusCode: 200 }).as('deleteFlow');
    });
  
    it('should load and display flows', () => {
      cy.wait('@getFlows');
      cy.get('[data-testid="flow-card"]').should('contain', 'Test Flow 1').and('contain', 'Test Flow 2');
    });
  
    it('should create a new flow', () => {
      cy.contains('button', 'Create New Flow').click();
      cy.get('input[placeholder="Enter flow name"]').type('New Test Flow');
      cy.contains('button', 'Save').click();
      cy.wait('@createFlow');
      cy.get('[data-testid="flow-card"]').should('contain', 'New Test Flow');
    });
  
    it('should update an existing flow', () => {
      cy.contains('[data-testid="flow-card"]', 'Test Flow 1').click();
      cy.contains('button', 'Save').click();
      cy.wait('@updateFlow');
      cy.get('[data-testid="toast"]').should('contain', 'Flow updated successfully');
    });
  
    it('should delete a flow', () => {
      cy.contains('[data-testid="flow-card"]', 'Test Flow 1').within(() => {
        cy.get('[data-testid="dropdown-trigger"]').click();
      });
      cy.get('[data-testid="dropdown-content"]').contains('Delete').click();
      cy.get('[data-testid="alert-dialog-action"]').contains('Delete').click();
      cy.wait('@deleteFlow');
      cy.get('[data-testid="flow-card"]').should('not.contain', 'Test Flow 1');
    });
  
    it('should filter flows based on search', () => {
      cy.get('input[placeholder="Search flows..."]').type('Test Flow 1');
      cy.get('[data-testid="flow-card"]').should('contain', 'Test Flow 1').and('not.contain', 'Test Flow 2');
    });
  
    it('should add a new node to the flow', () => {
      cy.contains('[data-testid="flow-card"]', 'Test Flow 1').click();
      cy.get('[data-testid="add-node-dropdown"]').click();
      cy.get('[data-testid="dropdown-content"]').contains('START').click();
      cy.get('.react-flow__node').should('have.length', 1);
    });
  
    it('should connect nodes in the flow', () => {
      cy.contains('[data-testid="flow-card"]', 'Test Flow 1').click();
      cy.get('[data-testid="add-node-dropdown"]').click();
      cy.get('[data-testid="dropdown-content"]').contains('START').click();
      cy.get('[data-testid="add-node-dropdown"]').click();
      cy.get('[data-testid="dropdown-content"]').contains('END').click();
      cy.get('.react-flow__node').first().trigger('mousedown', { button: 0 });
      cy.get('.react-flow__node').last().trigger('mousemove').trigger('mouseup');
      cy.get('.react-flow__edge').should('have.length', 1);
    });
  });