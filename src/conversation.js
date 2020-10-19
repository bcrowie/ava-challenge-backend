module.exports = class Conversation {
  constructor({ conversationId, data }) {
    this.id = conversationId;
    this.lastMutation;
    this.text = data.text;
  }

  wsInsert(lastMutation, insertion) {
    this.text = insertion.value;
    this.lastMutation = insertion.item;
    return { op: "update", text: this.text, id: this.id };
  }

  mutate(insertion) {
    if (!this.lastMutation) {
      if (insertion.data.type === "delete") {
        return this._makeResponse(
          false,
          "Cannot delete text that doesnt exist"
        );
      }
      this.lastMutation = insertion;
      return this._makeResponse(true, "Conversation created");
    }

    const { index, length, type } = insertion.data;
    let result = [];

    if (!this._isValidOrigin(insertion)) {
      return this._makeResponse(false, "Origin out of sync");
    } else if (this._sameAuthorAndOrigin(insertion)) {
      return this._transform(insertion, this.lastMutation);
    } else {
      try {
        result =
          type === "insert"
            ? this._mergeStrings(insertion, index)
            : this._mergeStrings(insertion, index, index + length);

        this.lastMutation = insertion;
        this.text = result;
        return this._makeResponse(true, "Mutation applied successfully");
      } catch (err) {
        this._makeResponse(false, "Problem with mutation.");
      }
    }
  }

  _isValidOrigin(data) {
    if (!this.lastMutation) return true;

    const { alice, bob } = data.origin,
      aliceLastOrigin = this.lastMutation.origin.alice,
      bobLastOrigin = this.lastMutation.origin.bob;

    const tooLow = () => {
      return alice < aliceLastOrigin - 1 || bob < bobLastOrigin - 1;
    };

    const tooHigh = () => {
      return alice > aliceLastOrigin + 1 || bob > bobLastOrigin + 1;
    };

    return !tooHigh() || !tooLow();
  }

  _mergeStrings(data, start, end = start) {
    const { text, type } = data.data;

    if (type === "insert") {
      return [this.text.slice(0, start), text, this.text.slice(end)].join("");
    } else if (type === "delete") {
      return [this.text.slice(0, start), this.text.slice(end)].join("");
    }
  }

  _makeResponse(ok, msg = null) {
    return { ok, msg, status: ok ? 201 : 400, text: this.text };
  }

  _sameAuthorAndOrigin(data) {
    return (
      this.lastMutation.author !== data.author &&
      data.origin[this.lastMutation.author] ===
        this.lastMutation.origin[this.lastMutation.author]
    );
  }

  _transform(newState, lastState) {
    const { data } = newState;
    const { index, length, type } = data;
    let result = [];

    if (lastState.data.index > index) {
      if (type === "insert") {
        result = this._mergeStrings(newState, index);
      } else if (type === "delete") {
        const max =
          index + length > lastState.data.index
            ? lastState.data.index
            : index + length;
        result = this._mergeStrings(newState, index, max);
      }
    } else if (lastState.data.index < index) {
      if (lastState.data.type === "insert" && type === "insert") {
        const value = index + lastState.data.text.length;

        result = this._mergeStrings(newState, value);
      } else if (lastState.data.type === "delete") {
        if (type === "insert") {
          const value = index - lastState.data.length - 1;

          result = this._mergeStrings(newState, value);
        } else if (type === "delete") {
          const prevRange = lastState.data.index + lastState.data.length;
          const newRange = index + length;
          let min = index;

          if (prevRange > index) {
            if (prevRange > newRange) {
              return this._makeResponse(true, "No mutation needed.");
            } else {
              result = this._mergeStrings(newState, prevRange - index);
            }
          } else {
            result = this._mergeStrings(newState, min);
          }
        }
      }
    } else if (index === lastState.data.index) {
      const min =
        lastState.data.index + lastState.data.text.length > index + length
          ? lastState.data.index + lastState.data.text.length
          : index + length;

      result = this._mergeStrings(newState, index, min);
    }

    this.lastMutation = newState;
    this.text = result;
    return this._makeResponse(true, "Mutation made successfully");
  }
};
