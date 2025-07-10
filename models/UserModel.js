const AppModel = require('./AppModel');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');

class UserModel extends AppModel {
    constructor() {
        super();
    }

    generateToken(user) {
        return jwt.sign(
            { 
                id: user.id, 
                matricule: user.matricule 
            }, 
            jwtConfig.secret, 
            { 
                expiresIn: jwtConfig.expiresIn,
                algorithm: jwtConfig.algorithm
            }
        );
    }

    async createRecharge(data) {
        try {
            const { id_etudiant, montant, telephone, reference, devise } = data;
            const query = `
                INSERT INTO recharge (id_etudiant, date_created, montant, telephone, reference, devise)
                VALUES (?, NOW(), ?, ?, ?, ?)
            `;
            const result = await this.request(query, [id_etudiant, montant, telephone, reference, devise]);

            return result || false;
        } catch (error) {
            console.error('Error creating recharge:', error);
            throw error; // Propagation de l'erreur pour gestion ultérieure
        }
    }

    async getUserByAuth(data) {
        try {
            const query = `
                SELECT * 
                FROM etudiant
                WHERE matricule = ? AND secret = ?
            `;
            const {rows, count} = await this.request(query, [data.matricule, data.mdp]);
            
            if (rows && rows.length > 0) {
                const user = rows[0];
                const token = this.generateToken(user);
                return { user, token };
            }

            return null;
        } catch (error) {
            console.error('Error fetching user by auth:', error);
            throw error; // Propagation de l'erreur pour gestion ultérieure
        }
    }

    async getUserByMatricule(matricule) {
        try {
            const query = `
                SELECT * 
                FROM etudiant
                WHERE matricule = ?
            `;
            const result = await this.request(query, [matricule]);

            return result || [];
        } catch (error) {
            console.error('Error fetching user by matricule:', error);
            throw error; // Propagation de l'erreur pour gestion ultérieure
        }
    }

    async getRechargesByUserId(id){
        try {
            const query = `
                SELECT * 
                FROM recharge
                WHERE id_etudiant = ?
                ORDER BY date_created DESC
            `;
            const result = await this.request(query, [id]);

            return result || [];
        } catch (error) {
            console.error('Error fetching recharges by user ID:', error);
            throw error; // Propagation de l'erreur pour gestion ultérieure
        }
    }

    async updatePassword(data) {
        try {
            const query = `
                UPDATE etudiant 
                SET secret = ? 
                WHERE id = ?
            `;
            const result = await this.request(query, [data.mdp, data.etudiantId]);

            return result || false;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error; // Propagation de l'erreur pour gestion ultérieure
        }
    }

    async updateMatricule(data) {
        try {
            const query = `
                UPDATE etudiant 
                SET matricule = ? 
                WHERE id = ?
            `;
            const result = await this.request(query, [data.matricule, data.etudiantId]);

            return result || false;
        } catch (error) {
            console.error('Error updating matricule:', error);
            throw error; // Propagation de l'erreur pour gestion ultérieure
        }
    }

    async updatePhotoUser(data) {
        try {
            const query = `
                UPDATE etudiant 
                SET avatar = ? 
                WHERE id = ?
            `;
            const result = await this.request(query, [data.avatar, data.etudiantId]);

            return result || false;
        } catch (error) {
            console.error('Error updating user avatar:', error);
            throw error; // Propagation de l'erreur pour gestion ultérieure
        }
    }

    async updateUser(col, val, etudiantId) {
        try {
            const query = `
                UPDATE etudiant 
                SET ${col} = ? 
                WHERE id = ?
            `;
            const result = await this.request(query, [val, etudiantId]);

            return result || false;
        } catch (error) {
            console.error(`Error updating user ${col}:`, error);
            throw error; // Propagation de l'erreur pour gestion ultérieure
        }
    }

    async updateRecharge(col, val, id_recharge) {
        try {
            const query = `
                UPDATE recharge 
                SET ${col} = ? 
                WHERE id = ?
            `;
            const result = await this.request(query, [val, id_recharge]);

            return result || false;
        } catch (error) {
            console.error('Error updating recharge status:', error);
            throw error; // Propagation de l'erreur pour gestion ultérieure
        }
    }

}

module.exports = UserModel;
