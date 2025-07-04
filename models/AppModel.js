const Model = require('./Model');

class AppModel extends Model {
    constructor() {
        super();
    }

    async getAllMentions() {
        const sql = `
            SELECT *
            FROM mention
        `;
        const result = await this.request(sql);
        return result || [];
    }

    async getProgrammes() {
        const sql = `
            SELECT s.*, m.designation AS 'mention', CONCAT(chef_mention.nom, ' ', chef_mention.post_nom, ' ', chef_mention.prenom) AS 'chef_section'
            FROM section s
            INNER JOIN mention m ON m.id = s.id_mention
            INNER JOIN agent chef_mention ON chef_mention.id = m.id_agent
        `;

        const result = await this.request(sql);
        return result || [];
    }

    async getProgrammeById(id) {
        const sql = `SELECT s.*, m.designation AS 'mention', CONCAT(chef_section.grade, '. ', chef_section.nom, ' ', chef_section.post_nom) AS 'chef_section', chef_section.telephone AS 'chef-phone', chef_section.avatar AS 'chef-photo', CONCAT(sec_section.grade, '. ', sec_section.nom, ' ', sec_section.post_nom) AS 'sec_section', sec_section.telephone AS 'sec-phone', sec_section.avatar AS 'sec-photo', chef_section.e_mail
            FROM section s
            INNER JOIN mention m ON m.id = s.id_mention
            INNER JOIN agent chef_section ON chef_section.id = m.id_agent
            INNER JOIN agent sec_section ON sec_section.id = s.id_sec
            WHERE s.id = ?
        `;
        const result = await this.request(sql, [id]);
        return result || [];
    }

    async getProgrammeByName(name) {
        const sql = `SELECT s.*, m.designation AS 'mention', CONCAT(chef_section.grade, '. ', chef_section.nom, ' ', chef_section.post_nom) AS 'chef_section', chef_section.telephone AS 'chef-phone', chef_section.avatar AS 'chef-photo', CONCAT(sec_section.grade, '. ', sec_section.nom, ' ', sec_section.post_nom) AS 'sec_section', sec_section.telephone AS 'sec-phone', sec_section.avatar AS 'sec-photo', chef_section.e_mail
            FROM section s
            INNER JOIN mention m ON m.id = s.id_mention
            INNER JOIN agent chef_section ON chef_section.id = m.id_agent
            INNER JOIN agent sec_section ON sec_section.id = s.id_sec
            WHERE s.designation = ?
        `;
        const result = await this.request(sql, [name]);
        return result || [];
    }

    async getNiveauByName({name}) {
        const sql = `SELECT *
            FROM niveau
            WHERE intitule = ?
        `;
        const result = await this.request(sql, [name]);
        return result || null;
    }

    async getAnnees() {
        const sql = `
            SELECT *
            FROM annee
        `;
        const result = await this.request(sql);
        return result || [];
    }

    async getAnneeById(id) {
        const sql = `
            SELECT *
            FROM annee
            WHERE id = ?
        `;
        const result = await this.request(sql, [id]);
        return result || [];
    }

    async getCurrentAnnee() {
        const sql = `
            SELECT *
            FROM annee
            ORDER BY annee.id DESC
            LIMIT 1
        `;
        const result = await this.request(sql);
        
        return result || null; // Return the first result or null if not found
    }

    async getPromotions() {
        const sql = `SELECT p.*, s.designation AS 'section', n.intitule AS 'niveau', n.systeme
            FROM promotion p
            INNER JOIN section s ON p.id_section = s.id
            INNER JOIN niveau n ON n.id = p.id_niveau
        `;
        const result = await this.request(sql);
        return result || [];
    }

    async getPromotionsByProgramme(idProgramme) {
        const sql = `SELECT p.*, s.designation AS 'section', n.intitule AS 'niveau', n.systeme
            FROM promotion p
            INNER JOIN section s ON p.id_section = s.id
            INNER JOIN niveau n ON n.id = p.id_niveau
            WHERE p.id_section = ?
        `;
        const result = await this.request(sql, [idProgramme]);
        return result || [];
    }

    async getPromotionById(idPromotion) {
        const sql = `SELECT p.*, s.designation AS 'section', n.intitule AS 'niveau', n.systeme
            FROM promotion p
            INNER JOIN section s ON p.id_section = s.id
            INNER JOIN niveau n ON n.id = p.id_niveau
            WHERE p.id = ?
        `;
        const result = await this.request(sql, [idPromotion]);
        return result || [];
    }

    async getMatieresByPromotion(promotionId) {
        const sql = `SELECT mt.id, mt.designation, mt.credit, mt.code, ch.statut, ch.semestre, ut.designation AS 'unite-titre', ut.code AS 'unite-code'
            FROM matiere mt
            INNER JOIN unite ut ON ut.id = mt.id_unite
            INNER JOIN charge_horaire ch ON ch.id_matiere = mt.id
            WHERE ut.id_promotion = ? AND ch.id_annee = (
                SELECT annee.id
                FROM annee
                ORDER BY annee.id DESC
                LIMIT 1
            ) 
        `;
        const result = await this.request(sql, [promotionId]);
        return result || [];
        
    }

    async getMatiereById(matiereId) {
        const sql = `SELECT matiere.*, unite.designation AS 'unite', unite.id_promotion, unite.code AS code_ue, unite.competences, unite.objectifs, p.id_section, p.id_niveau, p.orientation, p.vision, s.designation AS 'mention', mt.designation AS 'filiere', n.intitule AS 'niveau', n.systeme
            FROM matiere 
            INNER JOIN unite ON unite.id = matiere.id_unite
            INNER JOIN promotion p ON p.id = unite.id_promotion
            INNER JOIN section s ON s.id = p.id_section
            INNER JOIN mention mt ON mt.id = s.id_mention
            INNER JOIN niveau n ON n.id = p.id_niveau
            WHERE matiere.id = ?`;
        const result = await this.request(sql, [matiereId]);
        return result || null;
    }

    async getChargeByMatiere({matiereId, anneeId}){
        const sql = `SELECT ch.*, tit.nom, tit.post_nom, tit.prenom, tit.avatar, tit.statut, tit.telephone, tit.e_mail, tit.grade
                FROM charge_horaire ch
                INNER JOIN agent tit ON tit.id = ch.id_titulaire
                WHERE ch.id_matiere = ? AND ch.id_annee = ?`;
        
        const result = await this.request(sql, [matiereId, anneeId]);

        return result || null;
    }

    async getMatieresByUE(uniteId){
        const sql = `SELECT *
            FROM matiere
            WHERE matiere.id_unite = ?`;

        const result = await this.request(sql, [uniteId]);

        return result || null;
    }

    async getLeconsByCharge(chargeId){
        const sql = `SELECT *
            FROM lecons
            WHERE id_charge = ?`;
        const result = await this.request(sql, [chargeId]);
        return result || [];
    }

    async getTravauxByCharge(chargeId){
        const sql = `
            SELECT *
            FROM travail
            WHERE id_charge = ?
        `;

        const result = await this.request(sql, [chargeId]);
        return result || [];
    }

    async getEtudiants(){
        const sql = `SELECT *
            FROM etudiant
        `;
        const result = await this.request(sql);
        return result || [];
    }

    async getNiveaux(){
        const sql = `SELECT *
            FROM niveau
            ORDER BY intitule
        `;
        const result = await this.request(sql);
        return result || [];
    }

    async getEtudiantById(etudiantId) {
        const sql = `SELECT *
            FROM etudiant
            WHERE id = ?
        `;
        const result = await this.request(sql, [etudiantId]);
        return result || null;
    }

    async getEtudiantByMatricule(matricule) {
        const sql = `SELECT *
            FROM etudiant
            WHERE matricule = ?
        `;
        const result = await this.request(sql, [matricule]);
        return result || null;
    }

    async getCotesEtudiant({etudiantId, matiereId, anneeId}) {
        const sql = `SELECT *
            FROM fiche_cotation
            WHERE id_etudiant = ? AND id_matiere = ? AND id_annee = ?
        `;
        const result = await this.request(sql, [etudiantId, matiereId, anneeId]);
        return result || null;
    }

    async getCommandeEtudiant({etudiantId, anneeId, promotionId}) {
        const sql = `SELECT er.*, cmde.id_enrollement, cmde.id_etudiant, cmde.montant, cmde.statut, cmde.reference AS 'payment_enrol', cmde.orderNumber AS 'payment_carnet', cmde.montant AS 'payment_frais', cmde.date_created AS 'date_payment'
                    FROM enrollements er
                    INNER JOIN commande_enrollement cmde ON cmde.id_enrollement = er.id
                    WHERE er.id_promotion = ? AND er.id_annee = ? AND cmde.id_etudiant = ?
                `;
        const result = await this.request(sql, [promotionId, anneeId, etudiantId]);
        return result || null;
    }

    async getAgents() {
        const sql = `SELECT *
            FROM agent
            ORDER BY nom, post_nom, prenom
        `;
        const result = await this.request(sql);
        return result || [];
    }

    async getActivites(){
        const sql = `SELECT cal.*, act.date, act.description, an.fin, an.debut
            FROM calendrier_acad cal
            INNER JOIN annee an ON an.id = cal.id_annee
            INNER JOIN activites_acad act ON act.id_calendrier = cal.id
            ORDER BY act.id DESC`;
        const result = await this.request(sql);
        return result || [];
    }

    async getCommuniques() {
        const sql = `SELECT cmq.*, CONCAT(agt.grade, ' ', agt.nom, ' ', agt.post_nom) AS 'auteur'
                FROM communique cmq
                INNER JOIN agent agt ON agt.id = cmq.id_auteur`;
        const result = await this.request(sql);
        return result || [];
    }

    async getCommuniqueById(id) {
        const sql = `SELECT cmq.*, CONCAT(agt.grade, ' ', agt.nom, ' ', agt.post_nom) AS 'auteur'
                FROM communique cmq
                INNER JOIN agent agt ON agt.id = cmq.id_auteur
                WHERE cmq.id = ?`;
        const result = await this.request(sql, [id]);
        return result || null;
    }

    async updateDescriptif(data) {
        const { id, objectif, place, penalites, mode_ens, horaire } = data;
        const sql = `   
            UPDATE charge_horaire
            SET objectifs_ec = ?, place_ec = ?, penalites_trvx = ?, mode_ens = ?, horaire = ?
            WHERE id = ?
        `;
        const result = await this.request(sql, [objectif, place, penalites, mode_ens, horaire, id]);
        return result || null;
    }

    async updateCharge(data) {
        const { id, objectif, place, penalites, mode_ens, horaire, documentId } = data;
        const sql = `   
            UPDATE charge_horaire
            SET objectifs_ec = ?, place_ec = ?, penalites_trvx = ?, mode_ens = ?, horaire = ?, url_document = ?
            WHERE id = ?
        `;
        const result = await this.request(sql, [objectif, place, penalites, mode_ens, horaire, documentId, id]);
        return result || null;
    }

    async updateSeance(data) {
        const { id, statut } = data;
        const sql = `
            UPDATE lecons
            SET statut = ?
            WHERE id = ?
        `;
        const result = await this.request(sql, [statut, id]);
        return result || null;
    }

    async deleteSeance(id){
        const sql = `
            DELETE FROM lecons
            WHERE id = ?
        `;
        const result = await this.request(sql, [id]);
        return result || null;
    }

    async createMessage({ nom, email, objet, contenu }) {
        const sql = `
            INSERT INTO contacts_institut (auteur_nom, auteur_email, message_objet, message_contenu)
            VALUES (?, ?, ?, ?)
        `;
        const result = await this.request(sql, [nom, email, objet, contenu]);
        return result || null;
    }

    async createMessageSection({ nom, email, objet, contenu, sectionId }) {
        const sql = `
            INSERT INTO contacts_sections (auteur_nom, auteur_email, message_objet, message_contenu, sectionId)
            VALUES (?, ?, ?, ?, ?)
        `;
        const result = await this.request(sql, [nom, email, objet, contenu, sectionId]);
        return result || null;
    }

    async createEtudiant(data) {
        const { nom, postNom, preNom, matricule, sexe, dateNaissance, telephone, email, photo: avatar } = data;
        console.log('Creating Etudiant with data:', data);
        const sql = `
            INSERT INTO etudiant (nom, post_nom, prenom, matricule, sexe, date_naiss, telephone, e_mail, avatar)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await this.request(sql, [nom, postNom, preNom, matricule, sexe, dateNaissance, telephone, email, avatar]);
        return result || null;
    }

    async createAdminEtudiant(data) {
        /**
         * INSERT INTO `administratif_etudiant`( `id_etudiant`, `section`, `option`, `annee`, `pourcentage_exetat`) VALUES ('[value-1]','[value-2]','[value-3]','[value-4]','[value-5]','[value-6]')
         */
        const { id_etudiant, section, option, annee, pourcentage_exetat } = data;
        const sql = `
            INSERT INTO \`administratif_etudiant\`( \`id_etudiant\`, \`section\`, \`option\`, \`annee\`, \`pourcentage_exetat\`) VALUES (?, ?, ?, ?, ?)
        `;
        const result = await this.request(sql, [id_etudiant, section, option, annee, pourcentage_exetat]);
        return result || null;
    }

    async createOriginEtudiant(data) {
        /**
         * INSERT INTO `origine_etudiant`(`id_etudiant`, `id_ville`, `nomPays`, `nomProvince`, `nomVille`) VALUES ('[value-1]','[value-2]','[value-3]','[value-4]','[value-5]','[value-6]')
         */
        const { id_etudiant, nomPays, nomProvince, nomVille } = data;
        const sql = `
            INSERT INTO \`origine_etudiant\`(\`id_etudiant\`, \`id_ville\`, \`nomPays\`, \`nomProvince\`, \`nomVille\`) VALUES (?, ?, ?, ?, ?)
        `;
        const result = await this.request(sql, [id_etudiant, 3, nomVille, nomProvince, nomPays]);
        return result || null;
    }

    async createInscriptionEtudiant(data) {
        /**
         * INSERT INTO `req_inscription`(`id_section`, `id_niveau`, `id_etudiant`, `date_creation`, `statut`, `nref`) VALUES
         */
        const { id_section, id_niveau, id_etudiant, nref } = data;
        const sql = `
            INSERT INTO req_inscription(
                id_section, 
                id_niveau, 
                id_etudiant, 
                date_creation, 
                statut, 
                nref
            ) VALUES (?, ?, ?, NOW(), ?, ?)
        `;
        const result = await this.request(sql, [id_section, id_niveau, id_etudiant, 'PENDING', nref]);
        return result || null;
    }

    async createLecon(data) {
        /**
         * lecons(titre, date_seance, `description`, `localisation`, `id_charge`, `lieu`, `activite`, `objectif`)
         */
        const { titre, date_seance, description, localisation, id_charge, lieu, activite, objectif } = data;
        const sql = `
            INSERT INTO lecons(titre, date_seance, description, localisation, id_charge, lieu, activite, objectif)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await this.request(sql, [titre, date_seance, description, localisation, id_charge, lieu, activite, objectif]);
        return result || null;
    }
}

module.exports = AppModel;
