import { Message } from "@/types/messages";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import Markdown from "react-markdown";

interface AssistantMessageProps {
    message: Message;
    idx: number;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ message, idx }) => {

    // Looks for code blocks wrapped in ```cpp
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
                
                return (
                  <Markdown key={indx}
                    components = {{strong: ({node, ...props}) => (
                      <>
                        <br />
                        <strong style={{color: 'black'}} {...props} />
                      </>
                    ),
                  }}
                  >
                    {block}
                  </Markdown>
                );

            })}

        </div>

    );

};

export default AssistantMessage;