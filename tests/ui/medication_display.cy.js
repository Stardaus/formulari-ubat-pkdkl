describe('Medication Display and Search', () => {
  beforeEach(() => {
    cy.visit('/'); // Visit the root of your application
  });

  it('should display all medications alphabetically on initial load', () => {
    // Assuming results are displayed in #results-container
    cy.get('#results-container .result-item').should('have.length.greaterThan', 0);

    // Get all medication names and assert they are in alphabetical order
    let previousName = '';
    cy.get('#results-container .result-item h3').each(($el) => {
      const currentName = $el.text();
      expect(currentName.localeCompare(previousName)).not.to.be.below(0); // currentName >= previousName
      previousName = currentName;
    });
  });

  it('should filter medications when typing in the search box', () => {
    cy.get('#searchBox').type('Drug A');
    cy.get('#results-container .result-item').should('have.length', 1);
    cy.get('#results-container .result-item h3').should('contain.text', 'Drug A');

    cy.get('#searchBox').clear().type('NonExistentDrug');
    cy.get('#results-container').should('contain.text', 'No results found.');
  });

  it('should display all medications when the "Show All Medications" button is clicked', () => {
    // First, filter to a subset
    cy.get('#searchBox').type('Drug A');
    cy.get('#results-container .result-item').should('have.length', 1);

    // Click the show all button
    cy.get('#showAllButton').click();

    // Assert all medications are displayed and in alphabetical order
    cy.get('#results-container .result-item').should('have.length.greaterThan', 1); // Assuming more than 1 total
    let previousName = '';
    cy.get('#results-container .result-item h3').each(($el) => {
      const currentName = $el.text();
      expect(currentName.localeCompare(previousName)).not.to.be.below(0);
      previousName = currentName;
    });
  });

  // Basic accessibility checks (can be expanded)
  it('should have accessible search input and buttons', () => {
    cy.get('#searchBox').should('have.attr', 'aria-label'); // Or placeholder
    cy.get('#clearSearchButton').should('have.attr', 'aria-label');
    cy.get('#showAllButton').should('have.attr', 'aria-label'); // Add aria-label to the button in index.html
  });
});