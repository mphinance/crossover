// Diary margin notes. Handwritten scrawls that react to what you typed, the way
// a former owner of this diary might have scribbled in the margin. Each note
// declares the slot it belongs to so the UI can drop it next to the relevant
// section. Pure function of the model + inputs — no randomness.

export function pickNotes(model) {
  if (!model?.valid) return []
  const notes = []
  const { inputs, yearsToFI: t, reachable, annualSpending } = model
  const { savingsRate, realReturn, withdrawalRate, sideHustle, currentNetWorth } = inputs

  const add = (slot, text) => notes.push({ slot, text })

  // --- the headline verdict ---
  if (!reachable) {
    add('headline', 'save something. anything. the math can’t start from zero.')
  } else if (t <= 5) {
    add('headline', 'show-off.')
  } else if (t <= 10) {
    add('headline', 'genuinely fast. keep your nerve.')
  } else if (t >= 35) {
    add('headline', 'a long road. small leaks sink big ships.')
  }

  // --- savings rate ---
  if (savingsRate >= 0.7) {
    add('savings', 'monk mode. respect.')
  } else if (savingsRate > 0 && savingsRate <= 0.1) {
    add('savings', 'this is the lever. pull harder.')
  }

  // --- return assumption ---
  if (realReturn >= 0.1) {
    add('return', 'optimistic, friend.')
  } else if (realReturn > 0 && realReturn <= 0.03) {
    add('return', 'cautious. respectable.')
  }

  // --- withdrawal rate ---
  if (withdrawalRate >= 0.05) {
    add('withdrawal', 'living dangerously down here.')
  } else if (withdrawalRate > 0 && withdrawalRate <= 0.03) {
    add('withdrawal', 'now you’re being careful.')
  }

  // --- the extras ---
  if (sideHustle > 0 && sideHustle >= annualSpending * 0.25) {
    add('sidehustle', 'the hustle is carrying you.')
  } else if (sideHustle > 0) {
    add('sidehustle', 'every extra dollar counts.')
  }

  if (currentNetWorth > 0 && currentNetWorth >= model.fiTarget * 0.25) {
    add('networth', 'nice head start.')
  }

  return notes
}

// First note for a given slot, if any.
export function noteFor(notes, slot) {
  return notes.find((n) => n.slot === slot)?.text ?? null
}
