import BaseAPIService from "~/components/api/BaseAPIService";

class QrService extends BaseAPIService {
  // GET: List all QR certificates (with optional params like search, pagination)
  async getQRs(params: object = {}): Promise<any> {
    return await this.request(`/qrs`, "GET", params);
  }

  // GET: Single QR certificate by ID
  async getQR(id: number | string): Promise<any> {
    return await this.request(`/qrs/${id}`, "GET");
  }

  // POST: Download QR for a specific certificate
  async qrDownload(id: number | string): Promise<any> {
    return await this.request(`/qrs/download/${id}`, "POST");
  }

  // POST: Create a new QR certificate
  async createQR(payload: object): Promise<any> {
    return await this.request(`/qrs`, "POST", payload);
  }

  // PUT: Update a QR certificate
  async updateQR(id: number | string, payload: object): Promise<any> {
    return await this.request(`/qrs/${id}`, "PUT", payload);
  }

  // GET: Scan a QR certificate by code
  async scanQR(code: number | string): Promise<any> {
    return await this.request(`/qrs/scan/${code}`, "GET");
  }

  // DELETE: Delete a QR certificate
  async deleteQR(id: number | string): Promise<any> {
    return await this.request(`/qrs/${id}`, "DELETE");
  }

  // POST: Bulk download QR certificates
  async bulkDownload(payload: object): Promise<any> {
    return await this.request(`/qrs/bulk-download`, "POST", payload);
  }
}

export const qrService = new QrService();
