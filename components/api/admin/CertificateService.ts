import BaseAPIService from "~/components/api/BaseAPIService";

class CertificateService extends BaseAPIService {
  // GET: List all certificates (with optional params like search, pagination)
  async getCertificates(params: object = {}): Promise<any> {
    return await this.request(`/certificates`, "GET", params);
  }

  // GET: Single certificate by ID
  async getCertificate(id: number | string): Promise<any> {
    return await this.request(`/certificates/${id}`, "GET");
  }

  async qrDownload(id: number | string): Promise<any> {
    return await this.request(`/certificates/download/qr/${id}`, "POST");
  }

  // POST: Create a new certificate
  async createCertificate(payload: object): Promise<any> {
    return await this.request(`/certificates`, "POST", payload);
  }

  // PUT: Update a certificate
  async updateCertificate(id: number | string, payload: object): Promise<any> {
    return await this.request(`/certificates/${id}`, "PUT", payload);
  }

  async scanCertificate(
    code: number | string,
    payload: object | undefined = undefined
  ): Promise<any> {
    // You could use payload here later if needed.
    return await this.request(`/certificates/scan/${code}`, "GET", payload);
  }

  async fetchAvailableSerial(payload: { serial_type: string }): Promise<any> {
    return await this.request("/certificates/serial-check", "POST", payload);
  }

  // DELETE: Delete a certificate
  async deleteCertificate(id: number | string): Promise<any> {
    return await this.request(`/certificates/${id}`, "DELETE");
  }

  async bulkDownload(payload: object): Promise<any> {
    return await this.request(`/certificates/download`, "POST", payload);
  }
}

export const certificateService = new CertificateService();
