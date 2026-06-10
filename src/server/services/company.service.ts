import { companyRepository } from "../repositories/company.repository";

export class CompanyService {
  async getAllCompanies() {
    return companyRepository.listAll();
  }

  async getCompanyBySlug(slug: string) {
    const company = await companyRepository.findBySlug(slug);
    if (!company) {
      throw new Error(`Company with slug ${slug} not found`);
    }
    return company;
  }
}

export const companyService = new CompanyService();
