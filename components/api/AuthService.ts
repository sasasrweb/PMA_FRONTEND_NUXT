import BaseAPIService from '~/components/api/BaseAPIService'

class AuthService extends BaseAPIService {
    async login(params: object): Promise<any> {
        return await this.request(`/login`, 'POST', params)
    }

    async logout(): Promise<any> {
        return await this.request(`/logout`, 'POST')
    }
}

export const authService = new AuthService();