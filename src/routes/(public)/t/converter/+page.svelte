<script>
    let inputText = "";
    let outputText = "";

    function separateSentences() {
        const allSentences = inputText
            .split('\n') // Split by pre-existing line breaks first
            .flatMap(paragraph => {
                // Split each paragraph by sentence
                return paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
            });

        let groupedSentences = [];
        let tempGroup = [];
        allSentences.forEach(sentence => {
            if (tempGroup.length === 3) {
                groupedSentences.push(tempGroup.join(' '));
                tempGroup = [];
            }
            tempGroup.push(sentence.trim());

            // If there was a pre-existing line break, treat it as its own group
            if (inputText.includes(`\n${sentence}`) && tempGroup.length > 0) {
                groupedSentences.push(tempGroup.join(' '));
                tempGroup = [];
            }
        });

        // Push any remaining sentences
        if (tempGroup.length > 0) {
            groupedSentences.push(tempGroup.join(' '));
        }

        outputText = groupedSentences.join("\n\n"); // Double newline to separate groups
    }
</script>

<style>
    textarea {
        width: 100%;
        height: 200px;
        margin-bottom: 20px;
    }
</style>

<h2>Input Text</h2>
<textarea bind:value={inputText}></textarea>
<button on:click={separateSentences}>Separate Sentences</button>

<h2>Output Sentences</h2>
<textarea bind:value={outputText} readonly></textarea>