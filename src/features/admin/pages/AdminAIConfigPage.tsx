import React, { useState } from 'react';
import { Save, AlertCircle, RefreshCw, Cpu, Brain, Check } from 'lucide-react';

export const AdminAIConfigPage: React.FC = () => {
  const [model, setModel] = useState('gemini-1.5-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [systemPrompt, setSystemPrompt] = useState(
    'Bạn là chuyên gia tư vấn mua sắm công nghệ cho TechMart. Hãy gợi ý các sản phẩm phù hợp dựa vào lịch sử xem hàng, giỏ hàng hiện tại, và sở thích của khách hàng một cách thân thiện và chính xác.'
  );
  const [enableRec, setEnableRec] = useState(true);
  const [algorithm, setAlgorithm] = useState('ai-personalized');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-left text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Brain className="h-6 w-6 text-[#0a52be]" />
            <span>Cấu hình AI Recommendations</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">Cấu hình tham số mô hình ngôn ngữ lớn (LLM) và thuật toán gợi ý sản phẩm tự động.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config Form */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          {/* Card 1: Parameters */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Tham số mô hình</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mô hình AI sử dụng</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800 text-xs"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Khuyên dùng - Nhanh)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Thông minh - Phân tích sâu)</option>
                  <option value="gpt-4o">GPT-4o (Đa năng)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Độ sáng tạo (Temperature): {temperature}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Prompt hướng dẫn hệ thống (System Context)</label>
              <textarea
                rows={5}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800 text-xs leading-normal"
                placeholder="Nhập prompt hướng dẫn bot..."
              />
              <p className="text-[10px] text-slate-400 mt-1">Prompt này định hình tính cách và hành vi gợi ý sản phẩm của chatbot AI.</p>
            </div>
          </div>

          {/* Card 2: Algorithm logic */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Thuật toán & Hiển thị</h3>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-slate-750 font-bold">Kích hoạt widget gợi ý ở trang chi tiết</label>
                <p className="text-slate-400 text-[10px]">Tự động hiển thị các sản phẩm liên quan gợi ý bởi AI.</p>
              </div>
              <input
                type="checkbox"
                checked={enableRec}
                onChange={(e) => setEnableRec(e.target.checked)}
                className="h-4 w-4 accent-[#0a52be] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Phương thức gợi ý sản phẩm</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800 text-xs"
              >
                <option value="ai-personalized">AI Personalized Recommender (Phân tích theo sở thích cá nhân)</option>
                <option value="collaborative-filtering">Collaborative Filtering (Người dùng có hành vi tương tự)</option>
                <option value="content-based">Content-Based Filtering (Dựa trên thông số cấu hình và nhãn)</option>
                <option value="popular">Popularity-Based (Các sản phẩm bán chạy nhất)</option>
              </select>
            </div>
          </div>

          {/* Form controls */}
          <div className="flex items-center space-x-3">
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 bg-[#0a52be] hover:bg-[#084299] text-white rounded-md font-bold shadow-sm transition-colors cursor-pointer text-xs"
            >
              <Save className="h-4 w-4" />
              <span>Lưu cấu hình</span>
            </button>
            {showSuccess && (
              <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                <Check className="h-4 w-4" />
                <span>Đã cập nhật cấu hình hệ thống AI!</span>
              </span>
            )}
          </div>
        </form>

        {/* Sidebar Info & Status */}
        <aside className="space-y-6">
          {/* Card: Status widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-1.5">
              <Cpu className="h-4 w-4 text-slate-500" />
              <span>Trạng thái dịch vụ</span>
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">LLM Server Status:</span>
                <span className="text-emerald-600 font-bold">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">API Response Time:</span>
                <span className="text-slate-800 font-mono font-bold">142ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gợi ý đã phát ra hôm nay:</span>
                <span className="text-slate-800 font-mono font-bold">1,248</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tỷ lệ click gợi ý (CTR):</span>
                <span className="text-slate-800 font-mono font-bold">8.4%</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center space-x-1.5 py-2 border border-slate-350 hover:bg-slate-50 text-slate-700 rounded-md font-semibold cursor-pointer text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Test API Connection</span>
            </button>
          </div>

          {/* Alert instructions */}
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center space-x-1.5 font-bold">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Lưu ý vận hành</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-700">
              Việc nâng độ sáng tạo (Temperature) lên cao (&gt; 0.8) có thể làm Chatbot tư vấn thân thiện hơn nhưng tăng nguy cơ đưa ra thông tin không chính xác về thông số phần cứng sản phẩm.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
