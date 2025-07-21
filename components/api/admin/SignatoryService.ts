import BaseAPIService from '~/components/api/BaseAPIService'

class SignatoryService extends BaseAPIService {
  // Get list of signatories with optional params (filter, pagination, etc)
  async getSignatories(params: object = {}): Promise<any> {
    return await this.request('/signatories', 'GET', params)
  }

  // Get a single signatory by ID
  async getSignatory(id: number | string): Promise<any> {
    return await this.request(`/signatories/${id}`, 'GET')
  }

  // Create a new signatory with signatoryData object
  async createSignatory(signatoryData: object): Promise<any> {
    return await this.request('/signatories', 'POST', signatoryData)
  }

  // Update an existing signatory by ID
  async updateSignatory(id: number | string, signatoryData: object): Promise<any> {
    return await this.request(`/signatories/${id}`, 'PUT', signatoryData)
  }

  // Delete a signatory by ID
  async deleteSignatory(id: number | string): Promise<any> {
    return await this.request(`/signatories/${id}`, 'DELETE')
  }
}

export const signatoryService = new SignatoryService();
