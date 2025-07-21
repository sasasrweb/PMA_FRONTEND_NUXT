import BaseAPIService from '~/components/api/BaseAPIService'

class UserService extends BaseAPIService {
  // Get list of courses with optional params (filter, pagination, etc)
  async getUsers(params: object = {}): Promise<any> {
    return await this.request('/users', 'GET', params)
  }

  // Get a single course by ID
  async getUser(id: number | string): Promise<any> {
    return await this.request(`/users/${id}`, 'GET')
  }

  // Create a new course with courseData object
  async createUser(courseData: object): Promise<any> {
    return await this.request('/users', 'POST', courseData)
  }

  // Update an existing course by ID with partial or full data
  async updateUser(id: number | string, courseData: object): Promise<any> {
    return await this.request(`/users/${id}`, 'PUT', courseData)
  }

  // Delete a course by ID
  async deleteUser(id: number | string): Promise<any> {
    return await this.request(`/users/${id}`, 'DELETE')
  }
}

export const userService = new UserService();
