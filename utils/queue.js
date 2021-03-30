module.exports = class Queue {
    constructor(size = 0) { // Constructor
        this.length = Math.max(0, size);
        this.elems = [];
        this.front = 0;
        this.back = -1;
        for (let i = 0; i < size; ++i) {
            this.elems[i] = null;
        }
    }
    
    empty() { // Checks whether the queue is empty
        return this.length ? this.back == -1 : this.elems.length == 0;
    }
    
    includes(value) { // Checks to see if a value is an element
        if (this.length) {
            for (let i = (this.front <= this.back ? this.front : 0); i <= this.back; ++i) {
                if (this.elems[i] == value) {
                    return true;
                }
            }
            if (this.front > this.back && !this.empty()) {
                for (let i = this.front; i < this.length; ++i) {
                    if (this.elems[i] == value) {
                        return true;
                    }
                }
            }
        }
        else {
            return this.elems.includes(value);
        }
    }
    
    push(value) { // Push elements at the back of the queue
        if (this.length) {
            var e = this.empty();
            if (++this.back >= this.length) {
                this.back = 0;
            }
            this.elems[this.back] = value;
            if (!e && this.front == this.back) {
                if (++this.front >= this.length) {
                    this.front = 0;
                }
            }
        }
        else {
            this.elems.push(value);
        }
        return value;
    }
    
    pop() { // Remove elements from the front of the queue
        var value;
        if (this.length) {
            value = this.elems[this.front];
            this.elems[this.front] = null;
            if (++this.front >= this.length) {
                this.front = 0;
            }
            if (this.front == this.back + 1 || (this.front == 0 && this.back == this.length - 1)) {
                this.front = 0;
                this.back = -1;
            }
        }
        else {
            value = this.elems.shift();
        }
        return value;
    }
    
    clear() { // Removes all elements from the queue
        this.elems = [];
        for (let i = 0; i < this.length; ++i) {
            this.elems[i] = null;
        }
    }
    
    deepcopy() { // Returns a deep copy, pretty straight forward
        var other = new Queue(this.length);
        other.elems = this.elems.slice();
        other.front = this.front;
        other.back = this.back;
        return other;
    }
};
