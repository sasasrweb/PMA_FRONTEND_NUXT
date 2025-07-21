import BaseAPIService from '~/components/api/BaseAPIService'

class PartnerService extends BaseAPIService {
  // Get list of partners with optional params (filter, pagination, etc)
  async getPartners(params: object = {}): Promise<any> {
    return await this.request('/partners', 'GET', params)
  }

  // Get a single partner by ID
  async getPartner(id: number | string): Promise<any> {
    return await this.request(`/partners/${id}`, 'GET')
  }

  // Create a new partner with partnerData object
  async createPartner(partnerData: object): Promise<any> {
    return await this.request('/partners', 'POST', partnerData)
  }

  // Update an existing partner by ID with partial or full data
  async updatePartner(id: number | string, partnerData: object): Promise<any> {
    return await this.request(`/partners/${id}`, 'PUT', partnerData)
  }

  // Delete a partner by ID
  async deletePartner(id: number | string): Promise<any> {
    return await this.request(`/partners/${id}`, 'DELETE')
  }
}

export const partnerService = new PartnerService();
