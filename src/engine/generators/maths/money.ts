import type { Question, Difficulty } from '../../../types/question';
import { Subject, MathsTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, uniqueId } from '../../../utils/random';

function formatMoney(pence: number): string {
  if (pence >= 100) {
    const pounds = Math.floor(pence / 100);
    const p = pence % 100;
    return p === 0 ? `\u00A3${pounds}` : `\u00A3${pounds}.${String(p).padStart(2, '0')}`;
  }
  return `${pence}p`;
}

export function generateMoney(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const tags: string[] = ['money'];

  let prompt: string;
  let answerPence: number;
  let explanation: string;

  if (difficulty <= 2) {
    // Calculate change from a round amount
    const items = difficulty === 1
      ? [20, 30, 40, 50, 60, 70, 80, 90]
      : [25, 35, 45, 55, 65, 75, 85, 95, 110, 130, 150];
    const cost = items[Math.floor(rng() * items.length)];
    const paid = difficulty === 1 ? 100 : (cost < 100 ? 100 : 200);
    answerPence = paid - cost;
    prompt = `You buy an item costing ${formatMoney(cost)} and pay with ${formatMoney(paid)}. How much change do you get?`;
    explanation = `${formatMoney(paid)} - ${formatMoney(cost)} = ${formatMoney(answerPence)}`;
    tags.push('change');
  } else if (difficulty === 3) {
    // Add two or three prices
    const type = rng() < 0.5 ? 'add_prices' : 'change';
    if (type === 'add_prices') {
      const p1 = randomInt(1, 5, rng) * 50 + randomInt(0, 9, rng) * 5;
      const p2 = randomInt(1, 4, rng) * 50 + randomInt(0, 9, rng) * 5;
      answerPence = p1 + p2;
      prompt = `A sandwich costs ${formatMoney(p1)} and a drink costs ${formatMoney(p2)}. What is the total cost?`;
      explanation = `${formatMoney(p1)} + ${formatMoney(p2)} = ${formatMoney(answerPence)}`;
      tags.push('addition');
    } else {
      const cost = randomInt(2, 8, rng) * 100 + randomInt(1, 19, rng) * 5;
      const paid = (Math.ceil(cost / 500) + 1) * 500;
      answerPence = paid - cost;
      prompt = `An item costs ${formatMoney(cost)}. You pay with ${formatMoney(paid)}. How much change do you receive?`;
      explanation = `${formatMoney(paid)} - ${formatMoney(cost)} = ${formatMoney(answerPence)}`;
      tags.push('change');
    }
  } else if (difficulty === 4) {
    // Discounts or multiply prices
    const type = rng() < 0.5 ? 'discount' : 'multiply';
    if (type === 'discount') {
      const price = randomInt(2, 10, rng) * 100;
      const discountPct = [10, 20, 25, 50][Math.floor(rng() * 4)];
      const discount = (discountPct / 100) * price;
      answerPence = price - discount;
      prompt = `A book costs ${formatMoney(price)}. It has a ${discountPct}% discount. What is the sale price?`;
      explanation = `${discountPct}% of ${formatMoney(price)} = ${formatMoney(discount)}. Sale price = ${formatMoney(price)} - ${formatMoney(discount)} = ${formatMoney(answerPence)}`;
      tags.push('discount');
    } else {
      const unitPrice = randomInt(1, 5, rng) * 50 + randomInt(0, 9, rng) * 5;
      const qty = randomInt(2, 6, rng);
      answerPence = unitPrice * qty;
      prompt = `Pencils cost ${formatMoney(unitPrice)} each. How much do ${qty} pencils cost?`;
      explanation = `${qty} × ${formatMoney(unitPrice)} = ${formatMoney(answerPence)}`;
      tags.push('multiplication');
    }
  } else {
    // Difficulty 5: multi-step money problems
    const type = rng() < 0.5 ? 'multi_item_change' : 'discount_change';
    if (type === 'multi_item_change') {
      const p1 = randomInt(1, 5, rng) * 100 + randomInt(1, 19, rng) * 5;
      const p2 = randomInt(1, 4, rng) * 100 + randomInt(1, 19, rng) * 5;
      const p3 = randomInt(1, 3, rng) * 100 + randomInt(1, 19, rng) * 5;
      const total = p1 + p2 + p3;
      const paid = (Math.ceil(total / 1000) + 1) * 1000;
      answerPence = paid - total;
      prompt = `You buy items costing ${formatMoney(p1)}, ${formatMoney(p2)} and ${formatMoney(p3)}. You pay with ${formatMoney(paid)}. How much change do you get?`;
      explanation = `Total = ${formatMoney(p1)} + ${formatMoney(p2)} + ${formatMoney(p3)} = ${formatMoney(total)}. Change = ${formatMoney(paid)} - ${formatMoney(total)} = ${formatMoney(answerPence)}`;
      tags.push('change', 'multi_step');
    } else {
      const price = randomInt(5, 20, rng) * 100;
      const discountPct = [10, 15, 20, 25][Math.floor(rng() * 4)];
      const discount = (discountPct / 100) * price;
      const salePrice = price - discount;
      const paid = (Math.ceil(salePrice / 1000) + 1) * 1000;
      answerPence = paid - salePrice;
      prompt = `A jacket costs ${formatMoney(price)} but has a ${discountPct}% discount. You pay with ${formatMoney(paid)}. How much change do you get?`;
      explanation = `Discount = ${formatMoney(discount)}. Sale price = ${formatMoney(salePrice)}. Change = ${formatMoney(paid)} - ${formatMoney(salePrice)} = ${formatMoney(answerPence)}`;
      tags.push('discount', 'change');
    }
  }

  const answerStr = formatMoney(answerPence);

  const distractors = new Set<string>();
  while (distractors.size < 3) {
    const offset = randomInt(1, Math.max(3, Math.floor(answerPence * 0.15) + 1), rng) * 5;
    const d = rng() < 0.5 ? answerPence + offset : answerPence - offset;
    if (d > 0) {
      const dStr = formatMoney(d);
      if (dStr !== answerStr) distractors.add(dStr);
    }
  }

  const correctId = uniqueId();
  const options = shuffle(
    [answerStr, ...distractors].map((v, i) => ({ id: i === 0 ? correctId : uniqueId(), label: v })),
    rng
  );

  return {
    id: uniqueId(),
    subject: Subject.MATHS,
    topic: MathsTopic.MONEY,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'money',
    generatorSeed: seed,
    tags,
  };
}
