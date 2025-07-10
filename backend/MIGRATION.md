# Migration des Summoner ID - Guide d'utilisation

## Problème

Suite au changement de clé API Riot, tous les Summoner ID ont changé. Cela affecte :
- La table `players` (Summoner ID invalides)
- La table `lp_tracker` (liens vers les anciens player_id)
- La table `player_history` (liens vers les anciens player_id)
- La table `player_stats_monthly` (liens vers les anciens player_id)

## Solution

Des scripts de migration ont été créés pour mettre à jour automatiquement tous les Summoner ID et préserver l'historique.

## Commandes disponibles

### 1. Migration des Summoner ID uniquement
```bash
npm run migrate
```
Cette commande :
- Récupère tous les joueurs de la base de données
- Obtient leurs nouveaux Summoner ID via l'API Riot
- Met à jour les Summoner ID dans la table `players`
- Préserve l'historique et les statistiques

### 2. Vérification de l'état
```bash
npm run migrate:check
```
Cette commande :
- Affiche tous les joueurs avec leurs PUUID actuels
- Montre les derniers joueurs mis à jour
- Donne des statistiques générales

### 3. Mise à jour complète
```bash
npm run migrate:update
```
Cette commande :
- Met à jour les Summoner ID ET toutes les données des joueurs
- Récupère les rangs, LP, wins/losses actuels
- Plus complet que la migration simple

## Utilisation recommandée

1. **D'abord, vérifiez l'état actuel :**
   ```bash
   npm run migrate:check
   ```

2. **Lancez la migration des Summoner ID :**
   ```bash
   npm run migrate
   ```

3. **Si nécessaire, faites une mise à jour complète :**
   ```bash
   npm run migrate:update
   ```

## Exemple de sortie

```
🚀 Début de la migration des Summoner ID...
📅 Date: 2024-01-15T10:30:00.000Z
=====================================
📊 25 joueurs trouvés, début de la migration...

[1/25] 🔄 Migration de PlayerName#TAG...
  🔄 Summoner ID changé: 12345678... → 87654321...
  ✅ PlayerName#TAG migré avec succès

[2/25] 🔄 Migration de AnotherPlayer#TAG2...
  ✅ Summoner ID inchangé pour AnotherPlayer#TAG2

📋 RÉSUMÉ DE LA MIGRATION
==========================
✅ Succès: 23/25
❌ Échecs: 2/25
🔄 Summoner ID changés: 15/25
📊 Summoner ID inchangés: 8/25

🎉 Migration terminée !
```

## Notes importantes

- **Rate limiting** : Le script attend 1 seconde entre chaque requête pour éviter de surcharger l'API Riot
- **Erreurs** : Les erreurs sont affichées en détail pour chaque joueur
- **Sécurité** : L'historique et les statistiques sont préservés
- **Logs** : Tous les logs sont affichés dans la console

## Dépannage

### Erreur "Format Riot ID invalide"
- Vérifiez que les `summoner_name` sont au format `Nom#Tag`
- Corrigez manuellement dans la base de données si nécessaire

### Erreur "Impossible de récupérer les nouvelles données"
- Vérifiez que la clé API Riot est valide
- Vérifiez que le joueur existe toujours
- Vérifiez la connectivité réseau

### Erreur "Erreur de mise à jour"
- Vérifiez les permissions de la base de données
- Vérifiez la connectivité à Supabase

## Variables d'environnement requises

Assurez-vous que ces variables sont définies dans votre `.env` :

```env
RIOT_API_KEY=votre_nouvelle_cle_api_riot
SUPABASE_URL=votre_url_supabase
SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
``` 