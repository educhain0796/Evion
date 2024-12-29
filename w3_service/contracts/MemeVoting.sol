// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MemeVoting {
    struct Meme {
        uint id;
        string url;
        uint votes;
    }

    mapping(uint => Meme) public memes;
    uint public memeCount;

    function addMeme(string memory _url) public {
        memeCount++;
        memes[memeCount] = Meme(memeCount, _url, 0);
    }

    function voteMeme(uint _id) public {
        require(_id > 0 && _id <= memeCount, "Invalid meme ID");
        memes[_id].votes++;
    }

    function getMeme(uint _id) public view returns (Meme memory) {
        require(_id > 0 && _id <= memeCount, "Invalid meme ID");
        return memes[_id];
    }
}
