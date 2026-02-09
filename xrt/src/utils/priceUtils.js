/**
 * Computes the total price of a product with selected size, modifiers, and quantity.
 * 
 * Formula:
 * Total = Quantity * [ (BasePrice * SizeMultiplier) + Sum(ModifierBase * LevelMultiplier * SizeMultiplier) ]
 * 
 * @param {Object} product - The product object containing basePrice.
 * @param {Object|String} selectedSize - The selected size object (with multiplier) or string.
 * @param {Object} selectedModifiers - Dictionary of selected modifiers.
 * @param {Number} quantity - Quantity of the product.
 * @returns {String} - The formatted total price (e.g., "12.50").
 */
export const computeTotalPrice = (product, selectedSize, selectedModifiers = {}, quantity = 1) => {
  if (!product) return "0.00";

  const LEVEL_MULTIPLIERS = {
    "Light": 0.5,
    "Normal": 1.0,
    "Extra": 1.5
  };

  // 1. Determine Base Price & Size Multiplier
  let currentBasePrice = product.basePrice || 0;
  let sizeMultiplier = 1;

  if (selectedSize && typeof selectedSize === 'object' && selectedSize.multiplier) {
    sizeMultiplier = parseFloat(selectedSize.multiplier);
  }
  
  // Adjusted Base Price for Size
  let pricePerUnit = currentBasePrice * sizeMultiplier;

  // 2. Add Modifiers Price
  // Iterate through all sections in selectedModifiers
  Object.keys(selectedModifiers).forEach(sectionTitle => {
    const selection = selectedModifiers[sectionTitle];
    
    // Find the section definition in product to get option details (price/baseExtra)
    const sectionDef = product.modifiers?.find(s => s.title === sectionTitle);
    if (!sectionDef) return;

    // Helper to process a single option choice
    const processOption = (optLabel, optValue) => {
      const optionDef = sectionDef.options?.find(o => o.label === optLabel);
      if (!optionDef) return;

      let baseExtra = optionDef.baseExtra !== undefined ? optionDef.baseExtra : (optionDef.price || 0);
      
      // Determine Level Multiplier
      let levelMult = 1;
      if (optValue && typeof optValue === 'object' && optValue.level) {
        levelMult = LEVEL_MULTIPLIERS[optValue.level] || 1;
      } else if (typeof optValue === 'string' && LEVEL_MULTIPLIERS[optValue]) {
        // Fallback if value itself is the level string (less common in current structure but possible)
         levelMult = LEVEL_MULTIPLIERS[optValue] || 1;
      }

      // Add to unit price: (ModifierBase * Level * SizeMultiplier)
      // Note: Requirement says "baseExtra * levelMultiplier * selectedSize.multiplier"
      pricePerUnit += (baseExtra * levelMult * sizeMultiplier);
    };

    if (Array.isArray(selection)) {
      // Multiple selection (simple strings)
      selection.forEach(label => processOption(label, null));
    } else if (typeof selection === 'object' && selection !== null) {
      // Complex object (key=label, value=details) or Single component
      // Check if it's a simple key-value map of options or something else
      // In ProductModal, for complex sections: { "OptionName": { level: "Normal", ... } }
      // For single sections: "OptionName" (string) OR { ... } if we refactored slightly
      
      if (sectionDef.type === 'single' && typeof selection === 'string') {
          processOption(selection, null);
      } else {
          // Iterate keys (option labels)
          Object.keys(selection).forEach(optLabel => {
              processOption(optLabel, selection[optLabel]);
          });
      }
    } else if (typeof selection === 'string') {
        // Single selection stored as string
        processOption(selection, null);
    }
  });

  // 3. Apply Quantity
  const total = pricePerUnit * quantity;

  // Return formatted string
  return total.toFixed(2);
};
