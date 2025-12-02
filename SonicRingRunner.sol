// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SonicRingRunner is ERC20, Ownable {
    
    struct PlayerStats {
        uint256 totalRings;
        uint256 highScore;
        uint256 gamesPlayed;
        uint8 favoriteCharacter;
    }

    struct LeaderboardEntry {
        address player;
        uint256 score;
    }

    // Player Data
    mapping(address => PlayerStats) public players;
    
    // Shop Data: Tracks which themes a user owns
    // Mapping for quick boolean checks: address -> themeId -> isOwned
    mapping(address => mapping(string => bool)) public hasTheme;
    // Array for listing them: address -> list of themeIds
    mapping(address => string[]) public ownedThemesList;

    // Leaderboard
    LeaderboardEntry[10] public leaderboard;

    constructor() ERC20("Sonic Ring Token", "RING") Ownable(msg.sender) {
        // Mint initial supply to deployer for testing if needed
        _mint(msg.sender, 10000 * 10**18);
    }

    // --- GAMEPLAY FUNCTIONS ---

    function collectRings(uint256 _rings, uint8 _characterId) external {
        require(_rings > 0, "No rings collected");

        // 1. Mint Tokens (1 Ring = 1 Token)
        _mint(msg.sender, _rings * 10**18);

        // 2. Update Stats
        PlayerStats storage stats = players[msg.sender];
        stats.totalRings += _rings;
        stats.gamesPlayed += 1;

        if (_rings > stats.highScore) {
            stats.highScore = _rings;
            stats.favoriteCharacter = _characterId;
            _updateLeaderboard(msg.sender, _rings);
        }
    }

    // --- SHOP FUNCTIONS ---

    function buyTheme(string memory themeId, uint256 cost) external {
        uint256 costInWei = cost * 10**18;
        
        require(balanceOf(msg.sender) >= costInWei, "Insufficient RING balance");
        require(!hasTheme[msg.sender][themeId], "Theme already owned");

        // Burn the tokens (User pays the game)
        _burn(msg.sender, costInWei);

        // Record ownership
        hasTheme[msg.sender][themeId] = true;
        ownedThemesList[msg.sender].push(themeId);
    }

    // --- VIEW FUNCTIONS ---

    function getPlayerStats(address _player) external view returns (
        uint256 totalRings, 
        uint256 highScore, 
        uint8 favoriteCharacter, 
        uint256 gamesPlayed, 
        uint256 tokenBalance
    ) {
        PlayerStats memory stats = players[_player];
        return (
            stats.totalRings,
            stats.highScore,
            stats.favoriteCharacter,
            stats.gamesPlayed,
            balanceOf(_player)
        );
    }

    function getLeaderboard() external view returns (address[] memory, uint256[] memory) {
        address[] memory addrs = new address[](10);
        uint256[] memory scores = new uint256[](10);
        for (uint i = 0; i < 10; i++) {
            addrs[i] = leaderboard[i].player;
            scores[i] = leaderboard[i].score;
        }
        return (addrs, scores);
    }

    function getOwnedThemes(address _user) external view returns (string[] memory) {
        return ownedThemesList[_user];
    }

    // --- INTERNAL HELPER ---

    function _updateLeaderboard(address _player, uint256 _score) internal {
        uint256 minScoreIndex = 0;
        uint256 minScore = leaderboard[0].score;

        for (uint i = 1; i < 10; i++) {
            if (leaderboard[i].score < minScore) {
                minScore = leaderboard[i].score;
                minScoreIndex = i;
            }
        }

        if (_score > minScore) {
            leaderboard[minScoreIndex] = LeaderboardEntry({
                player: _player,
                score: _score
            });
        }
    }
}