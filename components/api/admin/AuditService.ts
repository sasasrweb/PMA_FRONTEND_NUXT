import BaseAPIService from "~/components/api/BaseAPIService";

class AuditService extends BaseAPIService {
  // GET: List all certificates (with optional params like search, pagination)
  async getAudits(params: object = {}): Promise<any> {
    return await this.request(`/audits`, "GET", params);
  }
}

export const auditService = new AuditService();
