import { Message } from "@/types/messages";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";

interface AssistantMessageProps {
    message: Message;
    idx: number;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ message, idx }) => {

    const blocks = message.content.split(/(```[\w]*\n[\s\S]*?\n```)/g);

    return (

        <div key={idx}>

            {blocks.map((block, indx) => {

                const codeMatch = block.match(/```(\w*)\n([\s\S]*?)\n```/);

                if(codeMatch) {

                    const code = codeMatch[2] || '';

                    return (
                      <SyntaxHighlighter
                        language={'cpp'}
                        style={coy}
                        showLineNumbers
                        key={indx}
                      >
                        {code}
                      </SyntaxHighlighter>  
                    );
                }

                return <p key={indx}>{block}</p>

            })}

        </div>

    );

};

export default AssistantMessage;