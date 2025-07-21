// SignatureService.ts

import BaseAPIService from '~/components/api/BaseAPIService';

class SignatureService extends BaseAPIService {
  // Fetch all signatories
  async getSignatories(params: object = {}): Promise<any> {
    return await this.request('/signatories', 'GET', params);
  }

  // Fetch one signatory
  async getSignatory(id: number | string): Promise<any> {
    return await this.request(`/signatories/${id}`, 'GET');
  }

  // Create a signatory (without image handling)
  async createSignatory(signatoryData: object): Promise<any> {
    return await this.request('/signatories', 'POST', signatoryData);
  }

  // Update signatory
  async updateSignatory(id: number | string, signatoryData: object): Promise<any> {
    return await this.request(`/signatories/${id}`, 'PUT', signatoryData);
  }

  // Delete
  async deleteSignatory(id: number | string): Promise<any> {
    return await this.request(`/signatories/${id}`, 'DELETE');
  }

  // 🆕 Upload signature image (as base64) and return saved image URL
  async uploadSignatureImage(dataUrl: string, name: string): Promise<any> {
    return await this.request('/upload-signature', 'POST', {
      name,
      signature: dataUrl,
    });
  }
}

export const signatoryService = new SignatureService();
