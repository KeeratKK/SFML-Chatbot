import AssistantMessage from "@/components/AssistantMessage";
import { useState, useRef, useEffect } from "react";
import { Message } from "@/types/messages";;
import { Send } from "react-feather";

const MainChat = () => {

    const [message, setMessage] = useState<string>("");
    const [history, setHistory] = useState<Message[]>([
        {
        role: "assistant",
        content: "Hello ask me any questions about SFML.",
        },
    ]);
    const [initial, setInitial] = useState(false);

    useEffect(() => {
        if(!initial) {
            const storedHistory = sessionStorage.getItem("chatMessages");
            if(storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }

            setInitial(true);
        }
    }, [initial]);

    useEffect(() => {
        if(initial) {
            sessionStorage.setItem("chatMessages", JSON.stringify(history));
        }
    }, [history, initial]);

    const prevMessageRef = useRef<HTMLDivElement | null>(null);
  
    const handleClick = async () => {
        if(message == "") return;

        setHistory((oldHistory) => [
        ...oldHistory,
        {role: "user", content: message},
        ]);
        
        setMessage("");

        try {
          const response = await fetch("/chat", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({query: message, history: history}),
          });

          if(!response.ok) {
            throw new Error("Network response was bad");
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let assistantResponse = "";

          if(reader) {
            while(true) {
              const {done, value} = await reader.read();
              
              if(done) break;

              buffer += decoder.decode(value, {stream: true });

              let match;
              const jsonRegex = /({\s*"answer"\s*:\s*"(.*?)"\s*})|(```\w*\n[\s\S]*?\n```)/;

              while((match = jsonRegex.exec(buffer)) !== null) {

                console.log("Match:", match);

                if(match[1]) {
                  const jsonStr = match[1];

                  buffer = buffer.slice(match.index + jsonStr.length);

                  const jsonObj = JSON.parse(jsonStr);

                  assistantResponse += jsonObj.answer;
                }
                else if (match[3]) {
                  const jsonStr = match[3];

                  buffer = buffer.slice(match.index + jsonStr.length);

                  assistantResponse += JSON.parse(jsonStr).answer;
                }

              }

              setHistory((oldHistory) => {
                const updatedHistory = [...oldHistory];
                const lastMessage = updatedHistory[updatedHistory.length - 1];

                if(lastMessage?.role === "assistant") {
                  lastMessage.content = assistantResponse;
                }
                else {
                  updatedHistory.push({role:"assistant", content: assistantResponse});
                }

                return updatedHistory;

              });
            }
          }

        } catch(error) {
          console.log("Fetch Error:", error);
        }

    };

    useEffect(() => {

        if(prevMessageRef.current) {
        prevMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }

    }, [history]);


    return(

      <div className="flex flex-col gap-8 w-full items-center flex-grow max-h-full overflow-visible">
        <h1 className=" text-4xl text-transparent font-extralight bg-clip-text bg-gradient-to-r from-violet-800 to-fuchsia-500">
          SFML Chat
        </h1>
        <form
          className="rounded-2xl border-purple-700 border-opacity-5  border lg:w-3/4 flex-grow flex flex-col bg-white bg-cover max-h-full overflow-clip"
          onSubmit={(e) => {
            e.preventDefault();
            handleClick();
          }}
        >
          <div className="overflow-y-auto flex flex-col gap-5 p-10 h-full">
            {history.map((message: Message, idx) => {
              const isLastMessage = idx === history.length - 1;
              switch (message.role) {
                case "assistant":
                  return (
                    <div
                      ref={isLastMessage ? prevMessageRef : null}
                      key={idx}
                      className="flex gap-2"
                    >
                      <img
                        src="images/chatbot_pfp.jpg"
                        className="h-12 w-12 rounded-full"
                      />
                      <div className="w-auto max-w-xl break-words bg-white rounded-b-xl rounded-tr-xl text-black p-6 shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]">
                        <p className="text-sm font-medium text-violet-500 mb-2">
                          AI assistant
                        </p>
                        <AssistantMessage message={message} idx={idx}/>
                      </div>
                    </div>
                  );
                case "user":
                  return (
                    <div
                      className="w-auto max-w-xl break-words bg-white rounded-b-xl rounded-tl-xl text-black p-6 self-end shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]"
                      key={idx}
                      ref={isLastMessage ? prevMessageRef : null}
                    >
                      <p className="text-sm font-medium text-violet-500 mb-2">
                        You
                      </p>
                      {message.content}
                    </div>
                  );
              }
            })}
          </div>

          {/* input area */}
          <div className="flex sticky bottom-0 w-full px-6 pb-6 h-24">
            <div className="w-full relative">
              <textarea
                aria-label="chat input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                className="w-full h-full resize-none rounded-full border border-slate-900/10 bg-white pl-6 pr-24 py-[25px] text-base placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)] overflow-hidden"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleClick();
                  }
                }}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleClick();
                }}
                className="flex w-14 h-14 items-center justify-center rounded-full px-3 text-sm  bg-violet-600 font-semibold text-white hover:bg-violet-700 active:bg-violet-800 absolute right-2 bottom-2 disabled:bg-violet-100 disabled:text-violet-400"
                type="submit"
                aria-label="Send"
                disabled={!message}
              >
                <Send />
              </button>
            </div>
          </div>
        </form>
      </div>

    );
};

export default MainChat;
