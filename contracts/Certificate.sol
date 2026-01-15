// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CollegeMediaCertificate
 * @dev ERC-721 NFT for issuing verifiable digital credentials
 * Certificates are issued for:
 * - Event Attendance
 * - Course Completion
 * - Achievement Badges
 */
contract CollegeMediaCertificate is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Mapping from token ID to certificate type
    mapping(uint256 => string) public certificateType;
    
    // Mapping from token ID to issue date
    mapping(uint256 => uint256) public issueDate;
    
    // Mapping from token ID to issuer (admin who minted)
    mapping(uint256 => address) public issuedBy;

    // Events
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string certificateType,
        string tokenURI
    );

    constructor() ERC721("College Media Certificate", "CMC") Ownable(msg.sender) {}

    /**
     * @dev Mint a new certificate NFT
     * @param recipient Address receiving the certificate
     * @param _certificateType Type of certificate (e.g., "EVENT_ATTENDANCE", "COURSE_COMPLETION")
     * @param _tokenURI Metadata URI (IPFS link to JSON metadata)
     */
    function mintCertificate(
        address recipient,
        string memory _certificateType,
        string memory _tokenURI
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        certificateType[tokenId] = _certificateType;
        issueDate[tokenId] = block.timestamp;
        issuedBy[tokenId] = msg.sender;

        emit CertificateMinted(tokenId, recipient, _certificateType, _tokenURI);

        return tokenId;
    }

    /**
     * @dev Verify if an address owns a specific certificate type
     */
    function hasCertificateType(address user, string memory _type) public view returns (bool) {
        uint256 balance = balanceOf(user);
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) == user && 
                keccak256(bytes(certificateType[i])) == keccak256(bytes(_type))) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Get all token IDs owned by an address
     */
    function getTokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter && index < balance; i++) {
            if (_ownerOf(i) == owner) {
                tokens[index] = i;
                index++;
            }
        }
        return tokens;
    }

    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
