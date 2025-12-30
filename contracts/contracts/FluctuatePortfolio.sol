// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FluctuatePortfolio
 * @dev 去中心化资产组合存储合约
 * @notice 用户可以存储和检索自己的资产配置信息
 */
contract FluctuatePortfolio {
    
    // ============ 数据结构 ============
    
    /**
     * @dev 单个资产结构
     * @param symbol 资产符号（如 "BTC", "ETH", "XAU"）
     * @param amount 持有数量（使用 18 位小数精度）
     * @param buyPrice 购入价格（可选，18 位小数精度）
     */
    struct Asset {
        string symbol;
        uint256 amount;
        uint256 buyPrice;
    }
    
    /**
     * @dev 投资组合结构
     * @param assets 资产数组
     * @param lastUpdated 最后更新时间戳
     */
    struct Portfolio {
        Asset[] assets;
        uint256 lastUpdated;
    }
    
    // ============ 状态变量 ============
    
    /// @notice 用户地址到投资组合的映射
    mapping(address => Portfolio) private portfolios;
    
    /// @notice 记录所有更新过投资组合的用户地址
    address[] private users;
    
    /// @notice 判断用户是否已经创建过投资组合
    mapping(address => bool) private hasPortfolio;
    
    // ============ 事件 ============
    
    /**
     * @dev 投资组合更新事件
     * @param user 用户地址
     * @param assetCount 资产数量
     * @param timestamp 更新时间戳
     */
    event PortfolioUpdated(
        address indexed user,
        uint256 assetCount,
        uint256 timestamp
    );
    
    /**
     * @dev 投资组合删除事件
     * @param user 用户地址
     * @param timestamp 删除时间戳
     */
    event PortfolioDeleted(
        address indexed user,
        uint256 timestamp
    );
    
    // ============ 主要功能 ============
    
    /**
     * @notice 更新用户的投资组合
     * @dev 会覆盖之前的所有资产数据
     * @param _assets 新的资产数组
     */
    function updatePortfolio(Asset[] calldata _assets) external {
        require(_assets.length > 0, "Portfolio cannot be empty");
        require(_assets.length <= 50, "Too many assets (max 50)");
        
        // 记录首次创建的用户
        if (!hasPortfolio[msg.sender]) {
            users.push(msg.sender);
            hasPortfolio[msg.sender] = true;
        }
        
        Portfolio storage portfolio = portfolios[msg.sender];
        
        // 清空旧数据
        delete portfolio.assets;
        
        // 添加新资产
        for (uint256 i = 0; i < _assets.length; i++) {
            require(bytes(_assets[i].symbol).length > 0, "Symbol cannot be empty");
            require(_assets[i].amount > 0, "Amount must be greater than 0");
            
            portfolio.assets.push(_assets[i]);
        }
        
        portfolio.lastUpdated = block.timestamp;
        
        emit PortfolioUpdated(msg.sender, _assets.length, block.timestamp);
    }
    
    /**
     * @notice 获取指定用户的投资组合
     * @param user 用户地址
     * @return assets 资产数组
     * @return lastUpdated 最后更新时间
     */
    function getPortfolio(address user) 
        external 
        view 
        returns (Asset[] memory assets, uint256 lastUpdated) 
    {
        Portfolio storage portfolio = portfolios[user];
        return (portfolio.assets, portfolio.lastUpdated);
    }
    
    /**
     * @notice 获取当前用户的投资组合
     * @return assets 资产数组
     * @return lastUpdated 最后更新时间
     */
    function getMyPortfolio() 
        external 
        view 
        returns (Asset[] memory assets, uint256 lastUpdated) 
    {
        Portfolio storage portfolio = portfolios[msg.sender];
        return (portfolio.assets, portfolio.lastUpdated);
    }
    
    /**
     * @notice 删除当前用户的投资组合
     */
    function deletePortfolio() external {
        require(hasPortfolio[msg.sender], "No portfolio to delete");
        
        delete portfolios[msg.sender];
        hasPortfolio[msg.sender] = false;
        
        emit PortfolioDeleted(msg.sender, block.timestamp);
    }
    
    /**
     * @notice 获取单个资产信息
     * @param user 用户地址
     * @param index 资产索引
     * @return asset 资产信息
     */
    function getAsset(address user, uint256 index)
        external
        view
        returns (Asset memory asset)
    {
        Portfolio storage portfolio = portfolios[user];
        require(index < portfolio.assets.length, "Invalid index");
        return portfolio.assets[index];
    }
    
    /**
     * @notice 获取投资组合中的资产数量
     * @param user 用户地址
     * @return count 资产数量
     */
    function getAssetCount(address user) 
        external 
        view 
        returns (uint256 count) 
    {
        return portfolios[user].assets.length;
    }
    
    /**
     * @notice 检查用户是否有投资组合
     * @param user 用户地址
     * @return exists 是否存在
     */
    function hasUserPortfolio(address user) 
        external 
        view 
        returns (bool exists) 
    {
        return hasPortfolio[user];
    }
    
    /**
     * @notice 获取所有用户数量
     * @return count 用户数量
     */
    function getTotalUsers() external view returns (uint256 count) {
        return users.length;
    }
    
    /**
     * @notice 批量获取用户地址（分页）
     * @param offset 起始索引
     * @param limit 获取数量
     * @return userList 用户地址数组
     */
    function getUsers(uint256 offset, uint256 limit)
        external
        view
        returns (address[] memory userList)
    {
        require(offset < users.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > users.length) {
            end = users.length;
        }
        
        userList = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            userList[i - offset] = users[i];
        }
        
        return userList;
    }
}
