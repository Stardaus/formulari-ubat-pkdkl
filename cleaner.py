import pandas as pd
import re

def aggressive_normalize_name(name):
    """
    A much more aggressive function to clean and standardize drug names for robust matching.
    It removes dosages, forms, salts, units, and other common keywords.
    """
    if not isinstance(name, str):
        return ''
    
    # Start with lowercase
    name = name.lower()
    
    # Remove content in all kinds of brackets
    name = re.sub(r'\[.*?\]|\(.*?\)|\{.*?\}', '', name)
    
    # Remove all digits
    name = re.sub(r'\d+', '', name)

    # Expanded list of common terms to remove. This is the key to better matching.
    terms_to_remove = [
        'tablet', 'injection', 'suspension', 'syrup', 'mixture', 'hcl', 'hydrochloride',
        'mg', 'ml', 'mcg', 'iu', '%', 'solution', 'cream', 'ointment', 'powder',
        'for', 'and', '&', 'activated', 'besylate', 'sodium', 'potassium', 'phosphate',
        'acetate', 'maleate', 'tartrate', 'succinate', 'capsule', 'cap', 'tab', 'inj',
        'soln', 'oint', 'syr', 'susp', 'powder for injection', 'solution for injection',
        'eye drops', 'ear drops', 'nasal spray'
    ]
    
    # Build a regex pattern to find and remove these whole words
    pattern = r'\b(' + '|'.join(re.escape(term) for term in terms_to_remove) + r')\b'
    name = re.sub(pattern, '', name)
    
    # Remove any remaining special characters (like '/' or '-')
    name = re.sub(r'[^a-z\s]', '', name)
    
    # Collapse multiple spaces into a single space and trim
    name = re.sub(r'\s+', ' ', name).strip()
    
    return name

def create_final_facility_formulary():
    """
    Generates the final facility formulary (fpkdkl.csv) using an aggressive 
    name normalization strategy to maximize the number of matched medications.
    """
    try:
        # Load the source files
        template_df = pd.read_csv('fukkm-template.csv')
        facility_df = pd.read_csv('cleaned-formulari-pkdkl.csv')

        # --- Data Cleaning and Pre-processing ---
        facility_df.rename(columns={
            'DRUG (GENERIC NAME)': 'Generic Name',
            'CATATAN': 'Catatan'
        }, inplace=True)
        facility_df['Catatan'] = facility_df['Catatan'].fillna('')

        # --- Aggressively Normalize Drug Names in Both Files ---
        template_df['Normalized Name'] = template_df['Generic Name'].apply(aggressive_normalize_name)
        facility_df['Normalized Name'] = facility_df['Generic Name'].apply(aggressive_normalize_name)
        
        # Remove any entries that become empty after normalization
        template_df = template_df[template_df['Normalized Name'] != '']
        facility_df = facility_df[facility_df['Normalized Name'] != '']

        # --- Aggregate Notes from Facility Formulary ---
        facility_notes = facility_df.groupby('Normalized Name')['Catatan'].apply(
            lambda notes: '; '.join(note for note in notes if pd.notna(note) and note.strip() != '')
        ).reset_index()

        # --- Filter and Merge ---
        # Before merging, drop duplicates from the template based on the normalized name.
        # This prevents issues if multiple strengths of the same drug exist in the template.
        template_unique_df = template_df.drop_duplicates(subset=['Normalized Name'], keep='first').copy()
        
        # Merge the unique template with the facility notes based on the clean, normalized name
        # We use an inner merge to ensure only drugs present in BOTH lists are included.
        final_df = pd.merge(
            template_unique_df,
            facility_notes,
            on='Normalized Name',
            how='inner'
        )
        
        # --- Finalize the Dataframe ---
        final_df['Prescribing Restrictions'] = final_df['Prescribing Restrictions'].fillna('None')
        final_df['Catatan'] = final_df['Catatan'].fillna('')

        # Append 'Catatan' to 'Prescribing Restrictions'
        def append_notes(row):
            restrictions = row['Prescribing Restrictions']
            catatan = row['Catatan']
            if catatan:
                if restrictions and restrictions.strip().lower() not in ['none', '']:
                    return f"{restrictions}; {catatan}"
                else:
                    return catatan
            return restrictions
        final_df['Prescribing Restrictions'] = final_df.apply(append_notes, axis=1)

        # Drop the helper columns to match the original template structure
        final_df.drop(columns=['Normalized Name', 'Catatan'], inplace=True)

        # Save the result to the final CSV file
        final_df.to_csv('fpkdkl.csv', index=False)

        print("--- PROCESS COMPLETE ---")
        print(f"Successfully created 'fpkdkl.csv'.")
        print(f"Total medications matched: {len(final_df)}")
        print("-----------------------")

    except FileNotFoundError as e:
        print(f"ERROR: File {e.filename} not found. Please ensure both CSV files are in the same directory.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

# Run the final script
create_final_facility_formulary()
