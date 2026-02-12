describe('Medication Display and Search', () => {
  beforeEach(() => {
    cy.visit('/');
    // Close disclaimer if it appears
    cy.get('button').contains('I Understand & Agree').click();
  });

  it('should display the search bar and welcome hero on initial load', () => {
    cy.get('input[placeholder*="Search by generic name"]').should('be.visible');
    cy.contains('Welcome to PKD KL Formulary').should('be.visible');
  });

  it('should filter medications when typing in the search box', () => {
    // We need to wait for data to load or type something that will likely exist
    // Since we are fetching from a real URL in production, but during tests it might be different.
    // Assuming the mock data from fetchSheet.js or the real data has some medications.
    cy.get('input[placeholder*="Search by generic name"]').type('Acid');
    
    // Check for results
    cy.get('h2').contains('Results').should('be.visible');
    cy.get('.group.flex.flex-col').should('have.length.greaterThan', 0);
  });

  it('should show medication details in a modal when clicked', () => {
    cy.get('input[placeholder*="Search by generic name"]').type('Acid');
    cy.get('.group.flex.flex-col').first().click();

    // Check modal
    cy.get('h2.text-xl').should('be.visible'); // Medication name in modal
    cy.contains('Indications').should('be.visible');
    cy.contains('Dosage').should('be.visible');
    
    // Close modal
    cy.get('button[aria-label="Close"]').first().click(); // There might be multiple Xs, let's be specific if needed
    // or better:
    cy.get('button').find('svg').parent().should('be.visible');
  });

  it('should toggle theme', () => {
    // Initial theme check (default might be light or dark depending on system)
    cy.get('html').then(($html) => {
      const isDark = $html.hasClass('dark');
      cy.get('button[aria-label="Toggle Theme"]').click();
      if (isDark) {
        cy.get('html').should('not.have.class', 'dark');
      } else {
        cy.get('html').should('have.class', 'dark');
      }
    });
  });
});
