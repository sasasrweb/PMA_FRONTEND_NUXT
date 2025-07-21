import BaseAPIService from '~/components/api/BaseAPIService'

class CourseService extends BaseAPIService {
  // Get list of courses with optional params (filter, pagination, etc)
  async getCourses(params: object = {}): Promise<any> {
    return await this.request('/courses', 'GET', params)
  }

  // Get a single course by ID
  async getCourse(id: number | string): Promise<any> {
    return await this.request(`/courses/${id}`, 'GET')
  }

  // Create a new course with courseData object
  async createCourse(courseData: object): Promise<any> {
    return await this.request('/courses', 'POST', courseData)
  }

  // Update an existing course by ID with partial or full data
  async updateCourse(id: number | string, courseData: object): Promise<any> {
    return await this.request(`/courses/${id}`, 'PUT', courseData)
  }

  // Delete a course by ID
  async deleteCourse(id: number | string): Promise<any> {
    return await this.request(`/courses/${id}`, 'DELETE')
  }
}

export const courseService = new CourseService();
