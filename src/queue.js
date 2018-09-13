module.exports = class Queue {
	constructor(size = 0) { // Constructor
		this.length = size;
		this.elems = [];
	}
	
	empty() { // Checks whether the queue is empty
		return this.elems.length == 0;
	}
	
	includes(value) { // Checks to see if a value is an element
		return this.elems.includes(value);
	}
	
	push(value) { // Push elements at the back of the queue
		this.elems.push(value);
		if (this.length) {
			while (this.elems.length > this.length) {
				this.pop();
			}
		}
		return value;
	}
	
	pop() { // Remove elements from the front of the queue
		return this.elems.shift();
	}
	
	clear() { // Removes all elements from the queue
		this.elems = [];
	}
	
	deepcopy() { // Returns a deep copy, pretty straight forward
		var other = new Queue(this.length);
		other.elems = this.elems.slice();
		return other;
	}
};
