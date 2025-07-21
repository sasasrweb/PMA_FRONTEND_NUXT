import BaseAPIService from "~/components/api/BaseAPIService";

class StudentDetailService extends BaseAPIService {
  // GET: List all students (with optional params like search, pagination)
  async getStudents(params: object = {}): Promise<any> {
    return await this.request(`/students`, "GET", params);
  }

  // GET: Single student by ID
  async getStudent(id: number | string): Promise<any> {
    return await this.request(`/students/${id}`, "GET");
  }

  // POST: Create a new student
  async createStudent(payload: object): Promise<any> {
    return await this.request(`/students`, "POST", payload);
  }

  // PUT: Update a student
  async updateStudent(id: number | string, payload: object): Promise<any> {
    return await this.request(`/students/${id}`, "PUT", payload);
  }

  // DELETE: Delete a student
  async deleteStudent(id: number | string): Promise<any> {
    return await this.request(`/students/${id}`, "DELETE");
  }
}

export const studentDetailService = new StudentDetailService();
