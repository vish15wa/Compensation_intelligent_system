import { savedComparisonRepository } from "../repositories/comparison.repository";
import { compensationRepository } from "../repositories/compensation.repository";

export class ComparisonService {
  async saveComparison(userId: string, name: string, queryParams: any) {
    const queryParamsString = typeof queryParams === "string" ? queryParams : JSON.stringify(queryParams);
    return savedComparisonRepository.create({
      userId,
      name,
      queryParams: queryParamsString,
    });
  }

  async getSavedComparisons(userId: string) {
    const list = await savedComparisonRepository.findByUserId(userId);
    return list.map(item => ({
      ...item,
      queryParams: JSON.parse(item.queryParams),
    }));
  }

  async deleteSavedComparison(id: string, userId: string) {
    const existing = await savedComparisonRepository.findById(id);
    if (!existing) {
      throw new Error("Comparison not found");
    }
    if (existing.userId !== userId) {
      throw new Error("Unauthorized to delete this comparison");
    }
    await savedComparisonRepository.delete(id, userId);
    return { success: true };
  }

  async compareEntities(params: {
    companies: string[];
    levels: string[];
    locations: string[];
  }) {
    const rawData = await compensationRepository.findRawCompareData(params);

    // Group raw data by [Company, Level, Location] combinations to get granular insights
    const groupings: Record<string, typeof rawData> = {};

    rawData.forEach((entry) => {
      // Create comparison key based on query filters
      const compKey = entry.company.name;
      const lvlKey = entry.level;
      const locKey = entry.location;
      
      const key = `${compKey} | ${lvlKey} | ${locKey}`;
      if (!groupings[key]) {
        groupings[key] = [];
      }
      groupings[key].push(entry);
    });

    const results = Object.entries(groupings).map(([key, items]) => {
      const [company, level, location] = key.split(" | ");
      const count = items.length;

      // Calculate averages
      const totalSum = items.reduce((sum, item) => sum + item.totalCompensation, 0);
      const baseSum = items.reduce((sum, item) => sum + item.base, 0);
      const bonusSum = items.reduce((sum, item) => sum + item.bonus, 0);
      const stockSum = items.reduce((sum, item) => sum + item.stock, 0);

      const avgTotal = Math.round(totalSum / count);
      const avgBase = Math.round(baseSum / count);
      const avgBonus = Math.round(bonusSum / count);
      const avgStock = Math.round(stockSum / count);

      // Sort items to get medians
      const sortedTotal = [...items].map((i) => i.totalCompensation).sort((a, b) => a - b);
      const medianTotal = sortedTotal[Math.floor(count / 2)];

      return {
        key,
        company,
        level,
        location,
        count,
        avgTotal,
        avgBase,
        avgBonus,
        avgStock,
        medianTotal,
        minTotal: sortedTotal[0],
        maxTotal: sortedTotal[count - 1],
      };
    });

    // Also get high level averages for each company compared
    const companyGroupings: Record<string, typeof rawData> = {};
    rawData.forEach(entry => {
      const cName = entry.company.name;
      if (!companyGroupings[cName]) companyGroupings[cName] = [];
      companyGroupings[cName].push(entry);
    });

    const companyAverages = Object.entries(companyGroupings).map(([company, items]) => {
      const count = items.length;
      const totalSum = items.reduce((sum, item) => sum + item.totalCompensation, 0);
      const baseSum = items.reduce((sum, item) => sum + item.base, 0);
      const bonusSum = items.reduce((sum, item) => sum + item.bonus, 0);
      const stockSum = items.reduce((sum, item) => sum + item.stock, 0);

      return {
        company,
        count,
        avgTotal: Math.round(totalSum / count),
        avgBase: Math.round(baseSum / count),
        avgBonus: Math.round(bonusSum / count),
        avgStock: Math.round(stockSum / count),
      };
    });

    return {
      granularComparison: results,
      companyComparison: companyAverages,
    };
  }
}

export const comparisonService = new ComparisonService();
